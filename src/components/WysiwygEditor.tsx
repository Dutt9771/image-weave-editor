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
  const isUpdatingRef = useRef(false);

  const handleCommand = useCallback((command: string, value?: string) => {
    if (isHtmlMode) return;
    
    try {
      document.execCommand(command, false, value);
      setTimeout(() => {
        if (editorRef.current && !isUpdatingRef.current) {
          const newContent = editorRef.current.innerHTML;
          setContent(newContent);
          onChange?.(newContent);
        }
      }, 0);
    } catch (error) {
      console.error('Command execution failed:', error);
    }
  }, [onChange, isHtmlMode]);

  const handleContentChange = useCallback(() => {
    if (isHtmlMode || isUpdatingRef.current) return;
    
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      if (newContent !== content) {
        setContent(newContent);
        onChange?.(newContent);
      }
    }
  }, [onChange, content, isHtmlMode]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      console.log('Image selected:', file.name, file.size);
      setSelectedImage(file);
      setShowImageCropper(true);
    } else {
      console.error('Invalid file type selected');
    }
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCroppedImage = (croppedImageUrl: string) => {
    console.log('Cropped image URL received:', croppedImageUrl);
    
    const imgHtml = `<img src="${croppedImageUrl}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px;" alt="Uploaded image" />`;
    
    if (isHtmlMode) {
      // In HTML mode, append to content
      const newContent = content + imgHtml;
      setContent(newContent);
      onChange?.(newContent);
    } else {
      // In visual mode, insert at cursor position
      if (editorRef.current) {
        isUpdatingRef.current = true;
        editorRef.current.focus();
        
        try {
          // Try to insert at cursor position
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const imgElement = document.createElement('div');
            imgElement.innerHTML = imgHtml;
            const imgNode = imgElement.firstChild;
            if (imgNode) {
              range.insertNode(imgNode);
              range.setStartAfter(imgNode);
              range.setEndAfter(imgNode);
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              // Fallback: append to end
              editorRef.current.innerHTML += imgHtml;
            }
          } else {
            // Fallback: append to end
            editorRef.current.innerHTML += imgHtml;
          }
          
          setTimeout(() => {
            if (editorRef.current) {
              const newContent = editorRef.current.innerHTML;
              setContent(newContent);
              onChange?.(newContent);
            }
            isUpdatingRef.current = false;
          }, 100);
        } catch (error) {
          console.error('Failed to insert image:', error);
          // Fallback method
          editorRef.current.innerHTML += imgHtml;
          setTimeout(() => {
            if (editorRef.current) {
              const newContent = editorRef.current.innerHTML;
              setContent(newContent);
              onChange?.(newContent);
            }
            isUpdatingRef.current = false;
          }, 100);
        }
      }
    }
    
    setShowImageCropper(false);
    setSelectedImage(null);
  };

  const insertVariable = (variable: string) => {
    const variableText = `{{${variable}}}`;
    if (isHtmlMode) {
      const newContent = content + variableText;
      setContent(newContent);
      onChange?.(newContent);
    } else {
      handleCommand('insertText', variableText);
    }
  };

  const toggleHtmlMode = () => {
    isUpdatingRef.current = true;
    
    if (isHtmlMode) {
      setIsHtmlMode(false);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
          isUpdatingRef.current = false;
        }
      }, 0);
    } else {
      if (editorRef.current) {
        const currentContent = editorRef.current.innerHTML;
        setContent(currentContent);
        onChange?.(currentContent);
      }
      setIsHtmlMode(true);
      isUpdatingRef.current = false;
    }
  };

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
  const fontFamilies = ['Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Verdana', 'Courier New'];
  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'];

  useEffect(() => {
    if (value !== content && !isUpdatingRef.current) {
      setContent(value);
      if (editorRef.current && !isHtmlMode) {
        isUpdatingRef.current = true;
        editorRef.current.innerHTML = value;
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
      }
    }
  }, [value, content, isHtmlMode]);

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
              disabled={isHtmlMode}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommand('italic')}
              className="hover:bg-blue-100"
              disabled={isHtmlMode}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommand('underline')}
              className="hover:bg-blue-100"
              disabled={isHtmlMode}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-blue-100" disabled={isHtmlMode}>
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
              <Button variant="ghost" size="sm" className="hover:bg-blue-100" disabled={isHtmlMode}>
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
              <Button variant="ghost" size="sm" className="hover:bg-blue-100" disabled={isHtmlMode}>
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
              <Button variant="ghost" size="sm" className="hover:bg-blue-100" disabled={isHtmlMode}>
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
              disabled={isHtmlMode}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommand('justifyCenter')}
              className="hover:bg-blue-100"
              disabled={isHtmlMode}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommand('justifyRight')}
              className="hover:bg-blue-100"
              disabled={isHtmlMode}
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
            onBlur={handleContentChange}
            style={{ minHeight: '384px' }}
            suppressContentEditableWarning
          >
            {!content && (
              <div className="text-gray-400 pointer-events-none select-none">
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
            console.log('Image cropper cancelled');
            setShowImageCropper(false);
            setSelectedImage(null);
          }}
        />
      )}
    </Card>
  );
};

export default WysiwygEditor;
