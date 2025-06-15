
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown } from 'lucide-react';

interface VariableInserterProps {
  variables: string[];
  onInsert: (variable: string) => void;
}

const VariableInserter: React.FC<VariableInserterProps> = ({ variables, onInsert }) => {
  const defaultVariables = [
    'userName', 'userEmail', 'firstName', 'lastName', 
    'companyName', 'date', 'time', 'currentYear'
  ];

  const allVariables = [...new Set([...variables, ...defaultVariables])];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-blue-100">
          <Plus className="h-4 w-4 mr-1" />
          Variables
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Insert Variable</h4>
          <div className="grid grid-cols-2 gap-2">
            {allVariables.map((variable) => (
              <Badge
                key={variable}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-100 justify-center"
                onClick={() => onInsert(variable)}
              >
                {variable}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click any variable to insert it into your content
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VariableInserter;
