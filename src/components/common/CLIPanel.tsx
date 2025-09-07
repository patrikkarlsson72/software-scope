import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Textarea,
  useToast,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Divider,
} from '@chakra-ui/react';
import { invoke } from '@tauri-apps/api/tauri';

interface CliCommand {
  command: string;
  args: string[];
  options: Record<string, string>;
}

interface CliResponse {
  success: boolean;
  output: string;
  error?: string;
}

export const CLIPanel: React.FC = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [cliEnabled, setCliEnabled] = useState(false);
  const [cliVersion, setCliVersion] = useState('');
  const toast = useToast();

  React.useEffect(() => {
    // Check CLI status on mount
    const checkCliStatus = async () => {
      try {
        const [enabled, version] = await Promise.all([
          invoke<boolean>('is_cli_enabled'),
          invoke<string>('get_cli_version')
        ]);
        setCliEnabled(enabled);
        setCliVersion(version);
      } catch (error) {
        console.error('Failed to check CLI status:', error);
      }
    };

    checkCliStatus();
  }, []);

  const parseCommand = (cmd: string): CliCommand => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0] || '';
    const args: string[] = [];
    const options: Record<string, string> = {};

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('--')) {
        const key = part.substring(2);
        const value = i + 1 < parts.length && !parts[i + 1].startsWith('--') 
          ? parts[i + 1] 
          : 'true';
        options[key] = value;
        if (value !== 'true') i++; // Skip the value if it's not a flag
      } else {
        args.push(part);
      }
    }

    return { command, args, options };
  };

  const executeCommand = async () => {
    if (!command.trim()) return;

    setIsExecuting(true);
    setOutput('');

    try {
      const cliCommand = parseCommand(command);
      const response = await invoke<CliResponse>('execute_cli_command', { cliCommand });
      
      if (response.success) {
        setOutput(response.output);
        toast({
          title: 'Command Executed',
          description: 'Command executed successfully',
          status: 'success',
          duration: 2000,
        });
      } else {
        setOutput(response.error || 'Unknown error occurred');
        toast({
          title: 'Command Failed',
          description: response.error || 'Unknown error occurred',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setOutput(`Error: ${errorMessage}`);
      toast({
        title: 'Command Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  const runExampleCommand = (cmd: string) => {
    setCommand(cmd);
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">Command Line Interface</Text>
          <Badge colorScheme={cliEnabled ? "green" : "orange"}>
            {cliEnabled ? "Enabled" : "Preview Mode"}
          </Badge>
        </HStack>

        {!cliEnabled && (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>CLI Preview Mode</AlertTitle>
              <AlertDescription>
                CLI functionality is in preview mode. Commands will return mock responses.
                Full CLI implementation is planned for future releases.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <Text fontSize="sm" color="gray.600">
          Version: {cliVersion}
        </Text>

        <Divider />

        <VStack spacing={3} align="stretch">
          <Text fontSize="md" fontWeight="semibold">Quick Commands:</Text>
          <HStack spacing={2} wrap="wrap">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => runExampleCommand('help')}
            >
              help
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => runExampleCommand('scan --format json')}
            >
              scan --format json
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => runExampleCommand('export --format csv')}
            >
              export --format csv
            </Button>
          </HStack>
        </VStack>

        <VStack spacing={3} align="stretch">
          <Text fontSize="md" fontWeight="semibold">Command Input:</Text>
          <HStack>
            <Input
              placeholder="Enter CLI command (e.g., 'help', 'scan --format json')"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              fontFamily="mono"
            />
            <Button 
              onClick={executeCommand}
              isLoading={isExecuting}
              loadingText="Executing..."
              colorScheme="blue"
            >
              Execute
            </Button>
          </HStack>
        </VStack>

        {output && (
          <VStack spacing={3} align="stretch">
            <Text fontSize="md" fontWeight="semibold">Output:</Text>
            <Box 
              p={3} 
              bg="gray.50" 
              borderRadius="md" 
              border="1px" 
              borderColor="gray.200"
              maxH="300px"
              overflowY="auto"
            >
              <Code 
                display="block" 
                whiteSpace="pre-wrap" 
                fontSize="sm"
                bg="transparent"
                p={0}
              >
                {output}
              </Code>
            </Box>
          </VStack>
        )}

        <VStack spacing={3} align="stretch">
          <Text fontSize="md" fontWeight="semibold">Available Commands:</Text>
          <Box fontSize="sm" color="gray.600">
            <Text><strong>scan</strong> - Scan installed programs</Text>
            <Text><strong>export</strong> - Export program list</Text>
            <Text><strong>help</strong> - Show help information</Text>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
};
