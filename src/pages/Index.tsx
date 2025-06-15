
import React, { useState } from 'react';
import WysiwygEditor from '@/components/WysiwygEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import parse from 'html-react-parser';

const Index = () => {
  const [editorContent, setEditorContent] = useState('');
  
  const sampleVariables = {
    userName: 'John Doe',
    userEmail: 'john@example.com',
    companyName: 'Acme Corporation',
    date: new Date().toLocaleDateString(),
  };

  const renderContentWithVariables = (content: string) => {
    let processedContent = content;
    Object.entries(sampleVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, value);
    });
    return parse(processedContent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WYSIWYG Editor
          </h1>
          <p className="text-gray-600">
            A powerful rich text editor with image cropping, dynamic variables, and HTML preview
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Editor
                  <Badge variant="secondary">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <WysiwygEditor
                  value={editorContent}
                  onChange={setEditorContent}
                  placeholder="Start creating your content..."
                  variables={sampleVariables}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(sampleVariables).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-sm">
                      {`{{${key}}}`} → {value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Live Preview
                  <Badge variant="secondary">Rendered</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-96 p-4 border rounded-lg bg-white">
                  {editorContent ? (
                    <div className="prose max-w-none">
                      {renderContentWithVariables(editorContent)}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-12">
                      Your content will appear here...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Raw HTML Output</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-64">
                  <code>{editorContent || 'No content yet...'}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-600">Rich Text Editing</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Bold, Italic, Underline</li>
                  <li>• Headings (H1-H6)</li>
                  <li>• Font Size & Family</li>
                  <li>• Text Color & Alignment</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">Media & Images</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Image Upload</li>
                  <li>• Built-in Cropper</li>
                  <li>• Drag & Drop Images</li>
                  <li>• Responsive Images</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-600">Advanced Features</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Dynamic Variables</li>
                  <li>• HTML/Preview Toggle</li>
                  <li>• Live Preview</li>
                  <li>• Modular Toolbar</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
