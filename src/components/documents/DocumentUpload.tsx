import { useState } from 'react';
import axios from 'axios';  // ✅ Import axios for API calls
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, Loader2, FileText, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const DocumentUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSummary(null);
    }
  };

  // Upload & process the file
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a document to upload",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // ✅ Send file to FastAPI backend
      const response = await axios.post("http://127.0.0.1:8000/summarize/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("API Response:", response.data); // ✅ Debugging

      if (response.data.summary) {
        setSummary(response.data.summary);
      } else {
        setSummary("No summary available.");
        toast({
          title: "Error",
          description: "No summary returned from the API",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing document:", error);
      setSummary("Failed to generate summary.");
      toast({
        title: "Processing failed",
        description: "There was an error processing your document",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download the summary as a text file
  const handleDownload = () => {
    if (!summary) return;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.split('.')[0]}-summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Summary downloaded",
      description: "The document summary has been downloaded successfully",
    });
  };

  return (
    <Card className="w-full shadow-lg border-primary/10 hover:border-primary/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Document Upload & Summary
        </CardTitle>
        <CardDescription>
          Upload academic documents to generate a summarized analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Input */}
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <label htmlFor="document" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Upload Document
          </label>
          <Input
            id="document"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOC, DOCX, TXT
          </p>
        </div>
        
        {/* Show Selected File */}
        {file && (
          <div className="bg-muted/30 p-3 rounded-md">
            <p className="text-sm font-medium">Selected file:</p>
            <p className="text-sm">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
          </div>
        )}

        {/* Always Show the Summary Box */}
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Document Summary</h3>
          <Textarea 
            value={summary || "Click 'Summarize' to generate a summary..."}  
            readOnly 
            className="h-[200px] overflow-auto border border-gray-300 rounded-md p-2" 
          />
        </div>
      </CardContent>

      {/* Buttons */}
      <CardFooter className="flex gap-2">
        <Button 
          onClick={handleUpload} 
          disabled={!file || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Document...
            </>
          ) : (
            <>
              <FileUp className="mr-2 h-4 w-4" />
              Process Document
            </>
          )}
        </Button>

        {summary && (
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Summary
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DocumentUpload;

