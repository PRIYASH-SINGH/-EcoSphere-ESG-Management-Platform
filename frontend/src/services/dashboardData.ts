import { BarChart2, Droplets, Users, Shield, Settings, FileText } from 'lucide-react';

export const navigation = [
  { label: 'Dashboard', icon: BarChart2, path: '/' },
  { label: 'Environmental', icon: Droplets, path: '/environmental' },
  { label: 'Social', icon: Users, path: '/social' },
  { label: 'Governance', icon: Shield, path: '/governance' },
  { label: 'Reports', icon: FileText, path: '/reports' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];
