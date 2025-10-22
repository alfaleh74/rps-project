import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/8bit/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";

type MenuItem = {
  label: string;
  action: () => void;
};

const defaultMenuItems: MenuItem[] = [
  {
    label: "START GAME",
    action: () => console.log("Starting game..."),
  },
  {
    label: "OPTIONS",
    action: () => console.log("Showing options..."),
  },
  {
    label: "HIGH SCORES",
    action: () => console.log("Showing high scores..."),
  },
  {
    label: "MULTIPLAYER",
    action: () => console.log("Multiplayer mode..."),
  },
  { label: "QUIT", action: () => console.log("Quitting game...") },
];

interface MainMenuProps extends React.ComponentProps<"div"> {
  menuItems?: MenuItem[];
  title?: string;
  description?: string;
}

export default function MainMenu({
  className,
  menuItems = defaultMenuItems,
  title = "Main Menu",
  description = "Retro 8-bit Quest",
  ...props
}: MainMenuProps) {
  return (
    <Card className={cn(className)} {...props}>
      <CardHeader className="flex flex-col items-center justify-center gap-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8">
          {menuItems.map((item) => (
            <Button 
              key={item.label} 
              className="flex items-center gap-2"
              onClick={item.action}
            >
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
