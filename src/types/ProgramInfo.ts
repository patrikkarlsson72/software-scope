export interface ProgramInfo {
  name: string;
  registry_name: string;
  version?: string;
  registry_time?: string;
  install_date?: string;
  installed_for?: string;
  install_location?: string;
  install_source?: string;
  publisher?: string;
  uninstall_string?: string;
  change_install_string?: string;
  quiet_uninstall_string?: string;
  comments?: string;
  about_url?: string;
  update_info_url?: string;
  help_link?: string;
  install_source_path?: string;
  installer_name?: string;
  release_type?: string;
  icon_path?: string;
  msi_filename?: string;
  estimated_size?: number;
  attributes?: string;
  language?: string;
  parent_key_name?: string;
  registry_path: string;
  program_type: 'Application' | 'SystemComponent' | 'Update' | 'Unknown';
  is_windows_installer: boolean;
  architecture: '32-bit' | '64-bit';
}
