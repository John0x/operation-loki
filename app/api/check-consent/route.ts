import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

interface ConsentResult {
  status: "pass" | "fail" | "unknown" | "no_tracking";
  gcsValue?: string;
  gcdValue?: string;
  message: string;
  details?: string;
}

const GOOGLE_DOMAINS = [
  'google-analytics.com',
  'googletagmanager.com',
  'doubleclick.net',
  'googleadservices.com',
  'googlesyndication.com',
  'google.com/pagead',
  'google.com/ads',
  'google.com/ccm',
  'analytics.google.com',
  'stats.g.doubleclick.net',
  'region1.analytics.google.com',
  'google.de/ads',
];

function isGoogleTrackingRequest(url: string): boolean {
  // Check against known Google domains
  if (GOOGLE_DOMAINS.some(domain => url.includes(domain))) {
    return true;
  }
  
  // Check for custom GTM subdomains (pattern: gtm.*.*/g/collect)
  if (url.includes('/g/collect') && url.includes('gtm.')) {
    return true;
  }
  
  // Check for Google Analytics measurement protocol URLs
  if (url.includes('/collect') && (url.includes('gcs=') || url.includes('gtm='))) {
    return true;
  }
  
  return false;
}

function parseConsentFromUrl(url: string): { gcs?: string; gcd?: string } {
  const urlObj = new URL(url);
  const gcs = urlObj.searchParams.get('gcs');
  const gcd = urlObj.searchParams.get('gcd');
  
  return { gcs: gcs || undefined, gcd: gcd || undefined };
}

function analyzeConsentStatus(gcs?: string, gcd?: string): ConsentResult {
  if (!gcs) {
    return {
      status: "unknown",
      message: "No consent mode detected - gcs parameter not found in Google tracking requests",
      details: "The website may not be using Google Consent Mode, or consent mode is not properly configured"
    };
  }

  // GCS format: G1xy where x=ad_storage, y=analytics_storage (1=granted, 0=denied)
  if (gcs.startsWith('G1')) {
    const consentChars = gcs.substring(2); // Remove 'G1' prefix
    
    if (consentChars === '11') {
      return {
        status: "fail",
        gcsValue: gcs,
        gcdValue: gcd,
        message: "Consent mode allows tracking by default",
        details: "Both ad_storage and analytics_storage are set to 'granted' by default, which means tracking is enabled before user consent"
      };
    } else if (consentChars === '00') {
      return {
        status: "pass",
        gcsValue: gcs,
        gcdValue: gcd,
        message: "Consent mode properly denies tracking by default",
        details: "Both ad_storage and analytics_storage are set to 'denied' by default, which is the recommended configuration"
      };
    } else {
      return {
        status: "unknown",
        gcsValue: gcs,
        gcdValue: gcd,
        message: `Partial consent detected: ${consentChars}`,
        details: `Mixed consent state - ad_storage: ${consentChars[0] === '1' ? 'granted' : 'denied'}, analytics_storage: ${consentChars[1] === '1' ? 'granted' : 'denied'}`
      };
    }
  }

  return {
    status: "unknown",
    gcsValue: gcs,
    gcdValue: gcd,
    message: "Unrecognized gcs parameter format",
    details: `Expected format G1xy but got: ${gcs}`
  };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Launch browser
    let browser;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to launch browser: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure Playwright is properly installed.` },
        { status: 500 }
      );
    }

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const page = await context.newPage();

    // Track network requests
    const googleRequests: string[] = [];
    const allRequests: string[] = [];
    let firstGoogleRequest: string | null = null;

    page.on('request', (request) => {
      const requestUrl = request.url();
      allRequests.push(requestUrl);
      
      if (isGoogleTrackingRequest(requestUrl)) {
        googleRequests.push(requestUrl);
        if (!firstGoogleRequest) {
          firstGoogleRequest = requestUrl;
        }
      }
    });

    try {
      // Navigate to the page with timeout
      await page.goto(targetUrl.toString(), { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait a bit more to capture any delayed requests
      await page.waitForTimeout(2000);

    } catch (error) {
      await browser.close();
      return NextResponse.json(
        { error: `Failed to load website: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    await browser.close();

    // Analyze results
    if (googleRequests.length === 0) {
      // Debug: include some sample requests
      const sampleRequests = allRequests.slice(0, 10);
      return NextResponse.json({
        status: "no_tracking",
        message: "No Google tracking requests detected",
        details: `The website does not appear to use Google Analytics, Google Ads, or Google Tag Manager. Found ${allRequests.length} total requests. First 10: ${sampleRequests.join(', ')}`
      });
    }

    // Find the first Google request that contains consent parameters
    let consentRequest = null;
    for (const request of googleRequests) {
      const { gcs } = parseConsentFromUrl(request);
      if (gcs) {
        consentRequest = request;
        break;
      }
    }
    
    if (!consentRequest) {
      return NextResponse.json({
        status: "unknown",
        message: "No consent mode detected - gcs parameter not found in Google tracking requests",
        details: `Found ${googleRequests.length} Google requests but none contain consent parameters. All requests: ${googleRequests.join(' | ')}`
      });
    }
    
    // Parse consent from the request that contains consent parameters
    const { gcs, gcd } = parseConsentFromUrl(consentRequest);
    const result = analyzeConsentStatus(gcs, gcd);

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}