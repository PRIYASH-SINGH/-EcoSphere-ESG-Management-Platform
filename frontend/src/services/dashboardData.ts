import {
  AlertTriangle,
  BarChart3,
  Droplets,
  Leaf,
  ShieldCheck,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

export const navigation = [
  { label: "Dashboard", icon: BarChart3 },
  { label: "Environmental", icon: Leaf },
  { label: "Social", icon: Users },
  { label: "Governance", icon: ShieldCheck },
  { label: "Reports", icon: Trophy },
];

export const metrics = [
  {
    label: "Energy saved",
    value: "42.8 MWh",
    change: "+12.4% this month",
    icon: Zap,
    tone: "gold",
  },
  {
    label: "Water recovered",
    value: "18.6k gal",
    change: "+8.1% efficiency",
    icon: Droplets,
    tone: "green",
  },
  {
    label: "Alert load",
    value: "7 open",
    change: "2 critical sites",
    icon: AlertTriangle,
    tone: "red",
  },
  {
    label: "Carbon offset",
    value: "3.2k t",
    change: "+5.7% YoY",
    icon: Leaf,
    tone: "gold",
  },
] as const;

export const facilityRows = [
  { site: "North Array", efficiency: "94%", load: "8.2 MW", status: "Healthy" },
  { site: "Harbor Reclaim", efficiency: "88%", load: "3.6 MW", status: "Healthy" },
  { site: "West Ridge", efficiency: "73%", load: "6.9 MW", status: "Inspect" },
  { site: "Urban Loop", efficiency: "81%", load: "4.8 MW", status: "Watch" },
];

export const alerts = [
  { title: "Battery thermal rise", detail: "West Ridge storage bay B", critical: true },
  { title: "Filter cycle overdue", detail: "Harbor Reclaim intake 2", critical: false },
  { title: "Peak tariff window", detail: "Urban Loop in 42 minutes", critical: false },
];
