import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PublicationSummary from "@/components/publications/PublicationSummary";
import { Publication, User } from "@/utils/types";
import { samplePublications } from "@/utils/publicationData";

const Summary = () => {
  const [user, setUser] = useState<User | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("academiaUserData");
    if (!userData) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData) as User;
      setUser(parsedUser);
      setPublications(samplePublications);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
    }
  }, [navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setSummary(result.summary);
      } else {
        alert(`Error: ${result.detail}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Publication Summary</h1>
          <p className="text-muted-foreground">
            Upload a file to generate a summary
          </p>

          <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            {loading ? "Uploading..." : "Upload and Summarize"}
          </button>

          {summary && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-100">
              <h3 className="text-xl font-semibold">Generated Summary</h3>
              <p>{summary}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Summary;
