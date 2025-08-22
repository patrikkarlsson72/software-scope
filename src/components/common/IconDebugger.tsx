import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Code,
  Badge,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { invoke } from '@tauri-apps/api/tauri';

interface DebugIconInfo {
  program_name: string;
  raw_icon_path?: string;
  processed_icon_path?: string;
  file_exists: boolean;
}

export const IconDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugIconInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDebugIcons = async () => {
    setLoading(true);
    try {
      const result = await invoke<DebugIconInfo[]>('debug_icon_paths');
      setDebugInfo(result);
    } catch (error) {
      console.error('Failed to debug icon paths:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">Icon Path Debugger</Text>
          <Button onClick={handleDebugIcons} isLoading={loading} size="sm">
            Debug Icon Paths
          </Button>
        </HStack>
        
        {loading && (
          <HStack spacing={2}>
            <Spinner size="sm" />
            <Text>Analyzing icon paths...</Text>
          </HStack>
        )}
        
        {debugInfo.length > 0 && (
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Program</Th>
                  <Th>Raw Path</Th>
                  <Th>Processed Path</Th>
                  <Th>File Exists</Th>
                </Tr>
              </Thead>
              <Tbody>
                {debugInfo.map((info, index) => (
                  <Tr key={index}>
                    <Td>
                      <Text fontSize="sm" fontWeight="semibold">
                        {info.program_name}
                      </Text>
                    </Td>
                    <Td>
                      {info.raw_icon_path ? (
                        <Code fontSize="xs" p={1}>
                          {info.raw_icon_path}
                        </Code>
                      ) : (
                        <Text fontSize="xs" color="gray.500">None</Text>
                      )}
                    </Td>
                    <Td>
                      {info.processed_icon_path ? (
                        <Code fontSize="xs" p={1}>
                          {info.processed_icon_path}
                        </Code>
                      ) : (
                        <Text fontSize="xs" color="gray.500">None</Text>
                      )}
                    </Td>
                    <Td>
                      <Badge colorScheme={info.file_exists ? 'green' : 'red'}>
                        {info.file_exists ? 'Yes' : 'No'}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
        
        {debugInfo.length > 0 && (
          <Box p={3} bg="blue.50" borderRadius="md">
            <Text fontSize="sm" color="blue.800">
              <strong>Summary:</strong> Found {debugInfo.filter(d => d.raw_icon_path).length} programs with icon paths,{' '}
              {debugInfo.filter(d => d.file_exists).length} with existing files.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
