import React, { useEffect, useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { save } from '@tauri-apps/api/dialog';
import { 
  Box,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  HStack,
  InputGroup,
  InputRightElement,
  Spinner,
  SimpleGrid,
  Card,
  CardBody,
  ButtonGroup,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from '@chakra-ui/react';
import { ProgramInfo } from '../../types/ProgramInfo';
import { useDebounce } from '../../hooks/useDebounce';
import { ProgramDetails } from './ProgramDetails';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { ProgramIcon } from '../common/ProgramIcon';

type SortField = 'name' | 'publisher' | 'install_date' | 'version';
type SortDirection = 'asc' | 'desc';
type DateFilter = 'all' | 'last7days' | 'last30days' | 'last90days' | 'custom';
type ProgramType = 'all' | 'Application' | 'SystemComponent' | 'Update';
type Architecture = 'all' | '32-bit' | '64-bit';

export const ProgramList: React.FC = () => {
  const [programs, setPrograms] = useState<ProgramInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: '',
  });
  const [programType, setProgramType] = useState<ProgramType>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [architecture, setArchitecture] = useState<Architecture>('all');
  const [selectedProgram, setSelectedProgram] = useState<ProgramInfo | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm);
  const toast = useToast();

  const publishers = useMemo(() => {
    const uniquePublishers = new Set(
      programs.map((p) => p.publisher).filter((p): p is string => p !== undefined && p !== '')
    );
    return Array.from(uniquePublishers).sort();
  }, [programs]);

  // Helper function to parse install date
  const parseInstallDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    // Registry dates are often in format YYYYMMDD
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return new Date(`${year}-${month}-${day}`);
  };

  // Optimize search logic
  const searchProgram = (program: ProgramInfo, term: string): boolean => {
    if (!term) return true;

    const searchLower = term.toLowerCase();
    const searchTerms = searchLower.split(' ').filter((t) => t.length > 0);

    return searchTerms.every(
      (term) =>
        program.name.toLowerCase().includes(term) ||
        program.publisher?.toLowerCase().includes(term) ||
        program.version?.toLowerCase().includes(term)
    );
  };

  const filteredAndSortedPrograms = useMemo(() => {
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
    }, 500);

    return [...programs]
      .filter((program) => {
        const matchesSearch = searchProgram(program, debouncedSearchTerm);
        const matchesPublisher =
          selectedPublisher === '' || program.publisher === selectedPublisher;

        // Date filtering
        let matchesDate = true;
        const installDate = parseInstallDate(program.install_date);

        if (installDate && dateFilter !== 'all') {
          const now = new Date();
          let compareDate: Date;

          switch (dateFilter) {
            case 'last7days':
              compareDate = new Date(now.setDate(now.getDate() - 7));
              matchesDate = installDate >= compareDate;
              break;
            case 'last30days':
              compareDate = new Date(now.setDate(now.getDate() - 30));
              matchesDate = installDate >= compareDate;
              break;
            case 'last90days':
              compareDate = new Date(now.setDate(now.getDate() - 90));
              matchesDate = installDate >= compareDate;
              break;
            case 'custom': {
              const startDate = customDateRange.start ? new Date(customDateRange.start) : null;
              const endDate = customDateRange.end ? new Date(customDateRange.end) : null;
              matchesDate =
                (!startDate || installDate >= startDate) && (!endDate || installDate <= endDate);
              break;
            }
          }
        }

        const matchesType = programType === 'all' || program.program_type === programType;
        const matchesArchitecture = architecture === 'all' || program.architecture === architecture;

        return matchesSearch && matchesPublisher && matchesDate && matchesType && matchesArchitecture;
      })
      .sort((a, b) => {
        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
  }, [
    programs,
    debouncedSearchTerm,
    selectedPublisher,
    dateFilter,
    customDateRange,
    programType,
    sortField,
    sortDirection,
    architecture,
  ]);

  // Fetch programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const installedPrograms = await invoke<ProgramInfo[]>('get_installed_programs');
        setPrograms(installedPrograms);
      } catch (err) {
        setError(err as string);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = async (format: 'CSV' | 'HTML' | 'XML' | 'TXT') => {
    try {
      const filePath = await save({
        filters: [{
          name: format,
          extensions: [format.toLowerCase()]
        }]
      });

      if (filePath) {
        await invoke('export_programs', {
          programs: filteredAndSortedPrograms,
          format,
          filePath
        });

        toast({
          title: 'Export Successful',
          description: `Programs exported to ${filePath}`,
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (loading) return <div>Loading installed programs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box p={5}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Installed Programs</Heading>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Export
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleExport('CSV')}>Export as CSV</MenuItem>
            <MenuItem onClick={() => handleExport('HTML')}>Export as HTML</MenuItem>
            <MenuItem onClick={() => handleExport('XML')}>Export as XML</MenuItem>
            <MenuItem onClick={() => handleExport('TXT')}>Export as Text</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      
      <Stack spacing={4}>
        <HStack spacing={4} align="flex-start">
          <InputGroup>
            <Input
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              width="300px"
            />
            {isSearching && (
              <InputRightElement>
                <Spinner size="sm" color="brand.500" />
              </InputRightElement>
            )}
          </InputGroup>

          <Select
            value={selectedPublisher}
            onChange={(e) => setSelectedPublisher(e.target.value)}
            width="250px"
            placeholder="All Publishers"
          >
            {publishers.map((publisher) => (
              <option key={publisher} value={publisher}>
                {publisher}
              </option>
            ))}
          </Select>

          <Select
            value={programType}
            onChange={(e) => setProgramType(e.target.value as ProgramType)}
            width="200px"
          >
            <option value="all">All Types</option>
            <option value="Application">Applications</option>
            <option value="SystemComponent">System Components</option>
            <option value="Update">Updates</option>
          </Select>

          <Select
            value={architecture}
            onChange={(e) => setArchitecture(e.target.value as Architecture)}
            width="150px"
          >
            <option value="all">All Architectures</option>
            <option value="32-bit">32-bit</option>
            <option value="64-bit">64-bit</option>
          </Select>

          <Text ml="auto" color="gray.600" fontSize="sm">
            Showing {filteredAndSortedPrograms.length} of {programs.length} programs
          </Text>
        </HStack>

        {/* Date Filter */}
        <HStack spacing={4}>
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            width="200px"
          >
            <option value="all">All Time</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </Select>

          {dateFilter === 'custom' && (
            <HStack>
              <Input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
              <Text>to</Text>
              <Input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </HStack>
          )}
        </HStack>

        {/* Sort Controls */}
        <ButtonGroup size="sm" variant="outline">
          <Button
            onClick={() => handleSort('name')}
            colorScheme={sortField === 'name' ? 'brand' : 'gray'}
          >
            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            onClick={() => handleSort('publisher')}
            colorScheme={sortField === 'publisher' ? 'brand' : 'gray'}
          >
            Publisher {sortField === 'publisher' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            onClick={() => handleSort('version')}
            colorScheme={sortField === 'version' ? 'brand' : 'gray'}
          >
            Version {sortField === 'version' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
        </ButtonGroup>

        {/* Program Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {filteredAndSortedPrograms.map((program) => (
            <Card 
              key={program.registry_path}
              cursor="pointer"
              _hover={{ shadow: 'md' }}
              onClick={() => setSelectedProgram(program)}
            >
              <CardBody>
                <HStack spacing={3} align="flex-start" mb={2}>
                  <ProgramIcon 
                    iconPath={program.icon_path} 
                    programName={program.name} 
                    size="24px" 
                  />
                  <Heading size="sm">{program.name}</Heading>
                </HStack>
                {program.publisher && <Text fontSize="sm">Publisher: {program.publisher}</Text>}
                {program.version && <Text fontSize="sm">Version: {program.version}</Text>}
                {program.install_date && <Text fontSize="sm">Installed: {program.install_date}</Text>}
                <Text fontSize="sm" color="gray.500">{program.architecture}</Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {selectedProgram && (
          <ProgramDetails
            program={selectedProgram}
            isOpen={!!selectedProgram}
            onClose={() => setSelectedProgram(null)}
          />
        )}
      </Stack>
    </Box>
  );
};
