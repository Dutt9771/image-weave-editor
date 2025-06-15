
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Image, Code, Eye, Type, Palette, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ImageCropper from './ImageCropper';
import VariableInserter from './VariableInserter';

interface WysiwygEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  variables?: { [key: string]: string };
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  variables = {}
}) => {
  const [content, setContent] = useState(value);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange?.(newContent);
    }
  }, [onChange]);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange?.(newContent);
    }
  }, [onChange]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setShowImageCropper(true);
    }
  };

  const handleCroppedImage = (croppedImageUrl: string) => {
    // Use document.execCommand to insert the image properly
    const imgHtml = `<img src="${croppedImageUrl}" style="max-width: 100%; height: auto; cursor: move;" draggable="true" />`;
    
    // Focus the editor and insert the image
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, imgHtml);
      handleContentChange();
    }
    
    setShowImageCropper(false);
    setSelectedImage(null);
  };

  const insertVariable = (variable: string) => {
    handleCommand('insertText', `{{${variable}}}`);
  };

  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switching from HTML to visual
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    } else {
      // Switching from visual to HTML
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
    setIsHtmlMode(!isHtmlMode);
  };

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
  const fontFamilies = ['Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Verdana', 'Courier New'];
  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'];

  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isHtmlMode]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="border-b p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommand('bold')}
              className="hover:bg-blue-100"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommand('italic')}
              className="hover:bg-blue-100"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommand('underline')}
              className="hover:bg-blue-100"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                <Type className="h-4 w-4 mr-1" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-1">
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <Button
                    key={level}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleCommand('formatBlock', `h${level}`)}
                  >
                    <span style={{ fontSize: `${20 - level * 2}px`, fontWeight: 'bold' }}>
                      Heading {level}
                    </span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Font Size */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                Size <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-32">
              <div className="space-y-1">
                {fontSizes.map((size) => (
                  <Button
                    key={size}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleCommand('fontSize', size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Font Family */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                Font <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40">
              <div className="space-y-1">
                {fontFamilies.map((font) => (
                  <Button
                    key={font}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    style={{ fontFamily: font }}
                    onClick={() => handleCommand('fontName', font)}
                  >
                    {font}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Colors */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => handleCommand('foreColor', color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommand('justifyLeft')}
              className="hover:bg-blue-100"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommand('justifyCenter')}
              className="hover:bg-blue-100"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommand('justifyRight')}
              className="hover:bg-blue-100"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Image Upload */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-blue-100"
          >
            <Image className="h-4 w-4" />
          </Button>

          {/* Variable Inserter */}
          <VariableInserter 
            variables={Object.keys(variables)} 
            onInsert={insertVariable} 
          />

          <div className="flex-1" />

          {/* HTML/Preview Toggle */}
          <Button
            variant={isHtmlMode ? "default" : "ghost"}
            size="sm"
            onClick={toggleHtmlMode}
            className="hover:bg-blue-100"
          >
            {isHtmlMode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
            {isHtmlMode ? 'Preview' : 'HTML'}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {isHtmlMode ? (
          <textarea
            className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              onChange?.(e.target.value);
            }}
            placeholder="Enter HTML here..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            className="w-full min-h-96 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onInput={handleContentChange}
            onPaste={handleContentChange}
            style={{ minHeight: '384px' }}
            suppressContentEditableWarning
          >
            {!content && (
              <div className="text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {showImageCropper && selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCrop={handleCroppedImage}
          onCancel={() => {
            setShowImageCropper(false);
            setSelectedImage(null);
          }}
        />
      )}
    </Card>
  );
};

export default WysiwygEditor;
