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
  VStack,
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
  Badge,
  Collapse,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import { ProgramInfo } from '../../types/ProgramInfo';
import { useDebounce } from '../../hooks/useDebounce';
import { ProgramDetails } from './ProgramDetails';
import { ChevronDownIcon, ChevronRightIcon, CloseIcon } from '@chakra-ui/icons';
import { ProgramIcon } from '../common/ProgramIcon';
import { useSettings } from '../../contexts/SettingsContext';

type SortField = 'name' | 'publisher' | 'install_date' | 'version';
type SortDirection = 'asc' | 'desc';
type DateFilter = 'all' | 'last7days' | 'last30days' | 'last90days' | 'custom';
type ProgramType = 'all' | 'Application' | 'SystemComponent' | 'Update' | 'Portable Application';
type Architecture = 'all' | '32-bit' | '64-bit' | 'User' | 'Unknown';
type InstallationSource = 'all' | 'System' | 'User' | 'Filesystem';
type VFDeployment = 'all' | 'vf-managed' | 'other-apps';

export const ProgramList: React.FC = () => {
  const { settings } = useSettings();
  const { isOpen: isFiltersOpen, onToggle: onFiltersToggle } = useDisclosure();
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
  const [installationSource, setInstallationSource] = useState<InstallationSource>('all');
  const [vfDeployment, setVfDeployment] = useState<VFDeployment>('vf-managed');
  const [selectedProgram, setSelectedProgram] = useState<ProgramInfo | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm);
  const toast = useToast();

  // Helper functions for filter management
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedPublisher) count++;
    if (dateFilter !== 'all') count++;
    if (programType !== 'all') count++;
    if (architecture !== 'all') count++;
    if (installationSource !== 'all') count++;
    if (vfDeployment !== 'all') count++;
    return count;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedPublisher('');
    setDateFilter('all');
    setProgramType('all');
    setArchitecture('all');
    setInstallationSource('all');
    setVfDeployment('all');
  };

  const getFilterChips = () => {
    const chips = [];
    if (searchTerm) {
      chips.push({ key: 'search', label: `Search: "${searchTerm}"`, onRemove: () => setSearchTerm('') });
    }
    if (selectedPublisher) {
      chips.push({ key: 'publisher', label: `Publisher: ${selectedPublisher}`, onRemove: () => setSelectedPublisher('') });
    }
    if (dateFilter !== 'all') {
      chips.push({ key: 'date', label: `Date: ${dateFilter}`, onRemove: () => setDateFilter('all') });
    }
    if (programType !== 'all') {
      chips.push({ key: 'type', label: `Type: ${programType}`, onRemove: () => setProgramType('all') });
    }
    if (architecture !== 'all') {
      chips.push({ key: 'arch', label: `Arch: ${architecture}`, onRemove: () => setArchitecture('all') });
    }
    if (installationSource !== 'all') {
      chips.push({ key: 'source', label: `Source: ${installationSource}`, onRemove: () => setInstallationSource('all') });
    }
    if (vfDeployment !== 'all') {
      chips.push({ key: 'vf', label: `VF: ${vfDeployment}`, onRemove: () => setVfDeployment('all') });
    }
    return chips;
  };

  // Format file size in human readable format
  const formatFileSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else if (sizeInKB < 1024 * 1024) {
      return `${(sizeInKB / 1024).toFixed(1)} MB`;
    } else {
      return `${(sizeInKB / (1024 * 1024)).toFixed(1)} GB`;
    }
  };

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
        const matchesInstallationSource = installationSource === 'all' || program.installation_source === installationSource;
        const matchesVFDeployment = vfDeployment === 'all' || 
          (vfDeployment === 'vf-managed' && program.is_vf_deployed) ||
          (vfDeployment === 'other-apps' && !program.is_vf_deployed);

        return matchesSearch && matchesPublisher && matchesDate && matchesType && matchesArchitecture && matchesInstallationSource && matchesVFDeployment;
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
    installationSource,
    vfDeployment,
  ]);

  // Fetch programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const installedPrograms = await invoke<ProgramInfo[]>('get_installed_programs');
        setPrograms(installedPrograms);
        console.log(`Loaded ${installedPrograms.length} programs`);
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

  const handleExport = async (format: 'CSV' | 'HTML' | 'XML' | 'TXT' = settings.defaultExportFormat) => {
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
          filePath,
          includeAdvancedDetails: settings.includeAdvancedDetails
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

  if (loading) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" color="blue.500" mb={4} />
        <Text fontSize="lg" color="gray.600">
          Scanning installed programs...
        </Text>
        <Text fontSize="sm" color="gray.500" mt={2}>
          This may take a moment for the first scan
        </Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={5} textAlign="center">
        <Text color="red.500" fontSize="lg" mb={2}>
          Error loading programs
        </Text>
        <Text color="gray.600">{error}</Text>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <HStack justify="space-between" mb={6}>
        <VStack align="flex-start" spacing={3}>
          <Heading size="lg">Installed Programs</Heading>
          <VStack align="flex-start" spacing={2}>
            <Button
              onClick={() => invoke('open_winver')}
              size="sm"
              colorScheme="blue"
              variant="outline"
              leftIcon={<Text fontSize="xs">🖥️</Text>}
              _hover={{
                bg: "blue.50",
                borderColor: "blue.300",
                transform: "translateY(-1px)",
                boxShadow: "md"
              }}
              _active={{
                transform: "translateY(0px)",
                boxShadow: "sm"
              }}
              transition="all 0.2s"
            >
              Check OS
            </Button>
            <Box
              bg="purple.50"
              border="1px solid"
              borderColor="purple.200"
              borderRadius="md"
              px={3}
              py={2}
              boxShadow="sm"
            >
              <Text fontSize="sm" color="purple.700" fontWeight="bold">
                VF Managed: {programs.filter(p => p.is_vf_deployed).length}
              </Text>
            </Box>
          </VStack>
        </VStack>
        <HStack spacing={2}>
          <Button 
            onClick={() => handleExport()} 
            colorScheme="blue"
            size="sm"
          >
            Quick Export ({settings.defaultExportFormat})
          </Button>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm">
              Export Options
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleExport('CSV')}>Export as CSV</MenuItem>
              <MenuItem onClick={() => handleExport('HTML')}>Export as HTML</MenuItem>
              <MenuItem onClick={() => handleExport('XML')}>Export as XML</MenuItem>
              <MenuItem onClick={() => handleExport('TXT')}>Export as Text</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </HStack>
      
      <Stack spacing={4}>
        {/* Main Search and Filter Controls */}
        <VStack spacing={4} align="stretch">
          {/* Search and Primary Controls */}
          <HStack spacing={4} align="flex-start" wrap="wrap">
            <InputGroup flex="1" minW="300px">
              <Input
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isSearching && (
                <InputRightElement>
                  <Spinner size="sm" color="brand.500" />
                </InputRightElement>
              )}
            </InputGroup>

            <Button
              leftIcon={isFiltersOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
              onClick={onFiltersToggle}
              variant="outline"
              colorScheme="brand"
              size="sm"
            >
              Filters {getActiveFiltersCount() > 0 && (
                <Badge ml={2} colorScheme="brand" variant="solid" borderRadius="full">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>

            <Text color="gray.600" fontSize="sm" whiteSpace="nowrap">
              Showing {filteredAndSortedPrograms.length} of {programs.length} programs
            </Text>
          </HStack>

          {/* Active Filter Chips */}
          {getActiveFiltersCount() > 0 && (
            <Wrap spacing={2}>
              {getFilterChips().map((chip) => (
                <WrapItem key={chip.key}>
                  <Tag size="sm" colorScheme="brand" borderRadius="full">
                    <TagLabel>{chip.label}</TagLabel>
                    <TagCloseButton onClick={chip.onRemove} />
                  </Tag>
                </WrapItem>
              ))}
              <WrapItem>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="brand"
                  onClick={clearAllFilters}
                  leftIcon={<CloseIcon />}
                >
                  Clear All
                </Button>
              </WrapItem>
            </Wrap>
          )}

          {/* Collapsible Filter Panel */}
          <Collapse in={isFiltersOpen} animateOpacity>
            <Box
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              bg="gray.50"
            >
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="sm" color="gray.700">Advanced Filters</Heading>
                  <Text fontSize="xs" color="gray.500">
                    Organize and filter your programs
                  </Text>
                </HStack>
                
                <Divider />

                {/* Filter Groups */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {/* Business Filters */}
                  <VStack spacing={3} align="stretch">
                    <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                      Business Filters
                    </Text>
                    
                    <Select
                      value={selectedPublisher}
                      onChange={(e) => setSelectedPublisher(e.target.value)}
                      placeholder="All Publishers"
                      size="sm"
                    >
                      {publishers.map((publisher) => (
                        <option key={publisher} value={publisher}>
                          {publisher}
                        </option>
                      ))}
                    </Select>

                    <Select
                      value={vfDeployment}
                      onChange={(e) => setVfDeployment(e.target.value as VFDeployment)}
                      size="sm"
                    >
                      <option value="all">All Applications</option>
                      <option value="vf-managed">VF Managed</option>
                      <option value="other-apps">Other Apps</option>
                    </Select>
                  </VStack>

                  {/* Technical Filters */}
                  <VStack spacing={3} align="stretch">
                    <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                      Technical Filters
                    </Text>
                    
                    <Select
                      value={programType}
                      onChange={(e) => setProgramType(e.target.value as ProgramType)}
                      size="sm"
                    >
                      <option value="all">All Types</option>
                      <option value="Application">Applications</option>
                      <option value="SystemComponent">System Components</option>
                      <option value="Update">Updates</option>
                    </Select>

                    <Select
                      value={architecture}
                      onChange={(e) => setArchitecture(e.target.value as Architecture)}
                      size="sm"
                    >
                      <option value="all">All Architectures</option>
                      <option value="32-bit">32-bit</option>
                      <option value="64-bit">64-bit</option>
                      <option value="User">User</option>
                      <option value="Unknown">Unknown</option>
                    </Select>
                  </VStack>

                  {/* Installation Filters */}
                  <VStack spacing={3} align="stretch">
                    <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                      Installation Filters
                    </Text>
                    
                    <Select
                      value={installationSource}
                      onChange={(e) => setInstallationSource(e.target.value as InstallationSource)}
                      size="sm"
                    >
                      <option value="all">All Sources</option>
                      <option value="System">System</option>
                      <option value="User">User</option>
                      <option value="Filesystem">Filesystem</option>
                    </Select>

                    <Select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                      size="sm"
                    >
                      <option value="all">All Time</option>
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="last90days">Last 90 Days</option>
                      <option value="custom">Custom Range</option>
                    </Select>

                    {dateFilter === 'custom' && (
                      <VStack spacing={2} align="stretch">
                        <Input
                          type="date"
                          size="sm"
                          value={customDateRange.start}
                          onChange={(e) => setCustomDateRange((prev) => ({ ...prev, start: e.target.value }))}
                          placeholder="Start Date"
                        />
                        <Input
                          type="date"
                          size="sm"
                          value={customDateRange.end}
                          onChange={(e) => setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))}
                          placeholder="End Date"
                        />
                      </VStack>
                    )}
                  </VStack>
                </SimpleGrid>
              </VStack>
            </Box>
          </Collapse>
        </VStack>

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
              borderLeft={program.is_vf_deployed ? '4px solid' : undefined}
              borderLeftColor={program.is_vf_deployed ? 'purple.400' : undefined}
              bg={program.is_vf_deployed ? 'purple.50' : undefined}
            >
              <CardBody>
                <VStack spacing={2} align="stretch">
                  <HStack spacing={3} align="flex-start">
                    <ProgramIcon 
                      programName={program.name} 
                      size="24px"
                      publisher={program.publisher}
                      iconPath={program.icon_path}
                      programType={program.program_type}
                    />
                    <VStack align="flex-start" spacing={1} flex="1">
                      <Heading size="sm">{program.name}</Heading>
                    </VStack>
                  </HStack>
                  
                  <VStack spacing={1} align="stretch">
                    {program.publisher && <Text fontSize="sm" color="gray.600">Publisher: {program.publisher}</Text>}
                    {program.version && <Text fontSize="sm" color="gray.600">Version: {program.version}</Text>}
                    {program.install_date && settings.showInstallDate && (
                      <Text fontSize="sm" color="gray.600">
                        Installed: {new Date(program.install_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString()}
                      </Text>
                    )}
                    {program.estimated_size && (
                      <Text fontSize="sm" color="gray.600">Size: {formatFileSize(program.estimated_size)}</Text>
                    )}
                    {program.is_vf_deployed && program.comments && (
                      <Text fontSize="sm" color="gray.600">
                        APPID: {program.comments.replace(/^APPID:\s*/, '')}
                      </Text>
                    )}
                  </VStack>
                </VStack>
                <HStack spacing={2} wrap="wrap">
                  {settings.showArchitecture && <Badge size="sm" colorScheme="blue">{program.architecture}</Badge>}
                  <Badge 
                    size="sm"
                    colorScheme={
                      program.installation_source === 'System' ? 'blue' :
                      program.installation_source === 'User' ? 'green' :
                      'orange'
                    }
                  >
                    {program.installation_source}
                  </Badge>
                  {program.is_vf_deployed && (
                    <Badge size="sm" colorScheme="purple" variant="solid" fontWeight="bold">
                      VF Managed
                    </Badge>
                  )}
                </HStack>
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
