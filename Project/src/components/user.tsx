import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid,} from "recharts";


function User() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // commit chart
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commitsData, setCommitsData] = useState([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [commitsError, setCommitsError] = useState("");



  const fetchRepos = async () => {
    setLoading(true);
    setError("");
  
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
  
      if (!response.ok) {
        if (response.status === 404) throw new Error("User not found 😢");
        if (response.status === 403) throw new Error("API rate limit exceeded 🚫");
        throw new Error("Something went wrong 😵");
      }
  
      const data = await response.json();
      setRepos(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommits = async (repoName: string) => {
    setCommitsLoading(true);
    setCommitsError("");
    setCommitsData([]);
    setSelectedRepo(repoName);
  
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 7); // last 7 days
    const isoDate = sinceDate.toISOString();
  
    try {
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/commits?since=${isoDate}`
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch commits");
      }
  
      const data = await response.json();
  
      // Group commits by date
      const commitsByDate: Record<string, number> = {};
      data.forEach((commit: any) => {
        const date = commit.commit.author.date.slice(0, 10); // YYYY-MM-DD
        commitsByDate[date] = (commitsByDate[date] || 0) + 1;
      });
  
      // Convert to array sorted by date
      const formattedData = Object.keys(commitsByDate).sort().map((date) => ({
        date,
        count: commitsByDate[date],
      }));
  
      setCommitsData(formattedData);
    } catch (err: any) {
      setCommitsError(err.message || "Error fetching commits");
    } finally {
      setCommitsLoading(false);
    }
  };
  
  

  return (
    <div className="min-h-screen max-w-2xl mx-auto pt-10 px-4">
      <h1 className="text-3xl font-bold mb-4">GitHub Profile Analyzer</h1>
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button onClick={fetchRepos}>Search</Button>
      </div>

        {/* Show Skeleton */}

      <div>

        {/* Show Error */}
            {error && (
                <p className="text-red-600 font-semibold mb-4">{error}</p>
            )}

            {loading && !error && (
        <div>
            <h2 className="text-xl font-semibold mb-2">Repositories:</h2>
            <ul className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-1/3 mb-2" /> {/* Fake repo name */}
                        <Skeleton className="h-4 w-2/3" />       {/* Fake description */}
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-1/4" />       {/* Fake link */}
                    </CardContent>
                    </Card>
                ))}
            </ul>
        </div>
        )}

        
        {/* Show Repos */}
        {!loading && !error && repos.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Repositories:</h2>
            <ul className="space-y-2">
            {repos.map((repo: any) => (
                <Card key={repo.id}>
                    <CardHeader>
                    <CardTitle>{repo.name}</CardTitle>
                    <CardDescription>{repo.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        View on GitHub
                    </a>
                    <Button className="mt-2 ml-5" onClick={() => fetchCommits(repo.name)}>View Commits Chart</Button>
                    </CardContent>
                </Card>
                ))}
            </ul>
          </div>
        )}
                    {selectedRepo && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-2">Commits in "{selectedRepo}" (last 7 days)</h3>

              {commitsLoading && <p>Loading commits chart...</p>}
              {commitsError && <p className="text-red-600">{commitsError}</p>}

              {!commitsLoading && commitsData.length === 0 && !commitsError && (
                <p>No commits found in the last 7 days.</p>
              )}

              {!commitsLoading && commitsData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={commitsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}


        {/* Show 'No repos' message if user has no public repos */}
            {!loading && !error && repos.length === 0 && username && (
                <p className="text-gray-600 mt-4">This user has no public repositories.</p>
            )}
      </div>
    </div>
  );
}

export default User;
