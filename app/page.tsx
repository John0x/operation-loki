"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface ConsentResult {
  status: "pass" | "fail" | "unknown" | "no_tracking";
  gcsValue?: string;
  gcdValue?: string;
  message: string;
  details?: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConsentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConsent = async () => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/check-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkConsent();
  };

  const getStatusIcon = (status: ConsentResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "fail":
        return <XCircle className="w-6 h-6 text-red-600" />;
      case "unknown":
      case "no_tracking":
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: ConsentResult["status"]) => {
    switch (status) {
      case "pass":
        return "text-green-600";
      case "fail":
        return "text-red-600";
      case "unknown":
      case "no_tracking":
        return "text-yellow-600";
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Google Consent Mode Checker</h1>
          <p className="text-lg text-muted-foreground">
            Check if a website has Google Consent Mode configured to deny tracking by default
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Website URL</CardTitle>
            <CardDescription>
              We&apos;ll analyze the first Google tracking request to check consent mode settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !url}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Website"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                Consent Mode Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-semibold ${getStatusColor(result.status)}`}>
                    {result.status === "pass" && "✅ PASS: Consent Mode Properly Configured"}
                    {result.status === "fail" && "❌ FAIL: Consent Mode Allows Tracking by Default"}
                    {result.status === "unknown" && "❓ UNKNOWN: Consent Mode Not Detected"}
                    {result.status === "no_tracking" && "❓ NO TRACKING: No Google Tracking Found"}
                  </h3>
                  <p className="text-muted-foreground mt-1">{result.message}</p>
                </div>

                {result.gcsValue && (
                  <div>
                    <h4 className="font-medium">GCS Parameter</h4>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{result.gcsValue}</code>
                  </div>
                )}

                {result.gcdValue && (
                  <div>
                    <h4 className="font-medium">GCD Parameter (Consent Mode v2)</h4>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{result.gcdValue}</code>
                  </div>
                )}

                {result.details && (
                  <div>
                    <h4 className="font-medium">Details</h4>
                    <p className="text-sm text-muted-foreground">{result.details}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            This tool checks if Google Consent Mode denies tracking by default on initial page load.
            <br />
            A properly configured site should show &quot;PASS&quot; status.
          </p>
        </div>
      </div>
    </div>
  );
}
