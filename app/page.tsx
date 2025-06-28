"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, CheckCircle, XCircle, Globe, Sparkles } from "lucide-react"

export default function ConsentModeChecker() {
  const [url, setUrl] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<{
    status: "pass" | "fail" | null
    message: string
  }>({ status: null, message: "" })

  const handleCheck = async () => {
    if (!url) return

    setIsChecking(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock result - in real app, this would be an actual API call
    const mockResult = Math.random() > 0.5
    setResult({
      status: mockResult ? "pass" : "fail",
      message: mockResult
        ? "Google Consent Mode is properly configured and denies tracking by default"
        : "Google Consent Mode is not configured or allows tracking by default",
    })
    setIsChecking(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full filter blur-xl opacity-30 mix-blend-lighten animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full filter blur-xl opacity-30 mix-blend-lighten animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full filter blur-xl opacity-20 mix-blend-lighten animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-gray-300">Privacy Compliance Tool</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6 leading-tight">
                Google Consent Mode
                <br />
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Checker
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Verify if a website has Google Consent Mode configured to deny tracking by default and ensure GDPR
                compliance
              </p>
            </div>

            {/* Main Card */}
            <Card className="backdrop-blur-xl bg-gray-900/40 border-white/10 shadow-2xl shadow-purple-500/10">
              <CardContent className="p-8 md:p-12">
                <div className="space-y-8">
                  {/* Input Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Enter Website URL</h3>
                        <p className="text-sm text-gray-400">
                          We&apos;ll analyze the first Google tracking request to check consent mode settings
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="h-14 pl-12 text-lg bg-gray-800/50 backdrop-blur-sm border-white/10 focus:border-indigo-300 focus:ring-indigo-200 text-white placeholder-gray-500 rounded-xl"
                          disabled={isChecking}
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      </div>
                      <Button
                        onClick={handleCheck}
                        disabled={!url || isChecking}
                        className="h-14 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      >
                        {isChecking ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Checking...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Check Website
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Results Section */}
                  {result.status && (
                    <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

                      <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10">
                        <div
                          className={`p-3 rounded-full ${
                            result.status === "pass" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
                          }`}
                        >
                          {result.status === "pass" ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <XCircle className="w-6 h-6" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant={result.status === "pass" ? "default" : "destructive"}
                              className={`${
                                result.status === "pass"
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-red-500 hover:bg-red-600"
                              } text-white font-semibold px-3 py-1`}
                            >
                              {result.status === "pass" ? "PASS" : "FAIL"}
                            </Badge>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{result.message}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info Section */}
                  <div className="bg-gradient-to-r from-gray-800/50 to-purple-900/30 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-indigo-900/50 rounded-lg">
                        <Shield className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white">How it works</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          This tool checks if Google Consent Mode denies tracking by default on initial page load. A
                          properly configured site should show &quot;PASS&quot; status, ensuring compliance with privacy
                          regulations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
