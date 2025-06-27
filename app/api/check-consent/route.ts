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
];

function isGoogleTrackingRequest(url: string): boolean {
  return GOOGLE_DOMAINS.some(domain => url.includes(domain));
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
    const browser = await chromium.launch();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const page = await context.newPage();

    // Track network requests
    const googleRequests: string[] = [];
    let firstGoogleRequest: string | null = null;

    page.on('request', (request) => {
      const requestUrl = request.url();
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
      return NextResponse.json({
        status: "no_tracking",
        message: "No Google tracking requests detected",
        details: "The website does not appear to use Google Analytics, Google Ads, or Google Tag Manager"
      });
    }

    // Parse consent from the first Google request
    const { gcs, gcd } = parseConsentFromUrl(firstGoogleRequest!);
    const result = analyzeConsentStatus(gcs, gcd);

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}