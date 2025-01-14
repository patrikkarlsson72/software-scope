export interface ProgramInfo {
  name: string;
  publisher?: string;
  install_date?: string;
  install_location?: string;
  version?: string;
  uninstall_string?: string;
  registry_path: string;
  program_type: 'Application' | 'SystemComponent' | 'Update' | 'Unknown';
  is_windows_installer: boolean;
}
