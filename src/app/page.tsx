"use client";

import { useState } from "react";

const HomePage = () => {
  const [acquiaUrl, setAcquiaUrl] = useState("");
  const [currentProject, setCurrentProject] = useState("");
  const [diqYear, setDiqYear] = useState("");
  const [diqTerm, setDiqTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults("");
    setError("");

    const scraperResults = await fetch("/api/scraper", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ acquiaUrl, currentProject }),
    }).then((res) => res.json());
    console.log("🚀 ~ handleSubmit ~ scraperResults:", scraperResults);

    // try {
    //   const response = await fetch("/api/review", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ acquiaUrl, currentProject, diqYear, diqTerm }),
    //   });

    //   const data = await response.json();

    //   if (!response.ok) {
    //     throw new Error(data.message || "Failed to complete review");
    //   }

    //   setResults(
    //     data.reviewResults ||
    //       "Review completed successfully, but no results found."
    //   );
    // } catch (err) {
    //   setError(
    //     err instanceof Error ? err.message : "An unknown error occurred"
    //   );
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auto Web Review</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="acquiaUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Acquia URL
          </label>
          <input
            type="text"
            id="acquiaUrl"
            value={acquiaUrl}
            onChange={(e) => setAcquiaUrl(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="currentProject"
            className="block text-sm font-medium text-gray-700"
          >
            Current Project
          </label>
          <select
            id="currentProject"
            value={currentProject}
            onChange={(e) => setCurrentProject(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            required
          >
            <option value="" disabled>
              Select a project
            </option>
            <option value="SJ">SJ</option>
            <option value="PS">PS</option>
            <option value="DIQ">DIQ</option>
          </select>
        </div>
        {currentProject === "DIQ" && (
          <>
            <div>
              <label
                htmlFor="diqYear"
                className="block text-sm font-medium text-gray-700"
              >
                DIQ Year
              </label>
              <input
                type="text"
                id="diqYear"
                value={diqYear}
                onChange={(e) => setDiqYear(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                required={currentProject === "DIQ"}
              />
            </div>
            <div>
              <label
                htmlFor="diqTerm"
                className="block text-sm font-medium text-gray-700"
              >
                DIQ Term
              </label>
              <select
                id="diqTerm"
                value={diqTerm}
                onChange={(e) => setDiqTerm(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                required={currentProject === "DIQ"}
              >
                <option value="" disabled>
                  Select a term
                </option>
                <option value="fall">Fall</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
              </select>
            </div>
          </>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 ${
            loading ? "bg-gray-400" : "bg-blue-500"
          } text-white rounded-md`}
        >
          {loading ? "Running Review..." : "Submit"}
        </button>
      </form>

      {loading && (
        <div className="mt-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Running website review. This may take several minutes...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Review Results</h2>
          <div className="bg-gray-100 p-4 rounded-md overflow-auto">
            <pre className="whitespace-pre-wrap text-sm">{results}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
