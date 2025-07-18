'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureItem,
  GanttMarker,
  GanttToday,
  GanttCreateMarkerTrigger,
} from '@/components/ui/shadcn-io/gantt';
import { fetchFeaturesForUser } from '@/features/gantt/actions';
import { useAuthStore } from '@/features/auth/store';
import { supabase } from '@/features/auth/client';
import { useSessionSync } from '@/features/auth/useSessionSync';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn-io/avatar';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';
import { EyeIcon, LinkIcon, TrashIcon } from 'lucide-react';

export default function DashboardPage() {
  useSessionSync();
  const [features, setFeatures] = useState<any[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUser({ id: session.user.id, email: session.user.email });
      }
      setAuthChecked(true);
    };
    check();
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    if (!user) {
      router.replace('/login');
    } else {
      fetchFeaturesForUser(user.id)
        .then((data) => setFeatures(data.map(mapFeature)))
        .catch(console.error);
    }
  }, [authChecked, user]);

  function getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0];
    return parts[0][0] + parts[1][0];
  }


  if (!authChecked || !user) {
    return <div className="p-10">Cargando sesión...</div>;
  }

  const grouped = features.reduce<Record<string, any[]>>((acc, feature) => {
    const key = feature.group.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(feature);
    return acc;
  }, {});

  return (
    <div className="h-[calc(100vh-4rem)] w-full p-4">
      <GanttProvider onAddItem={(d) => console.log(d)} range="monthly" zoom={100}>
        <GanttSidebar>
          {Object.entries(grouped).map(([group, list]) => (
            <GanttSidebarGroup key={group} name={group}>
              {list.map((feature) => (
                <GanttSidebarItem
                  key={feature.id}
                  feature={feature}
                  onSelectItem={() => console.log(feature.id)}
                />
              ))}
            </GanttSidebarGroup>
          ))}
        </GanttSidebar>

        <GanttTimeline>
          <GanttHeader />
          <GanttFeatureList>
            {Object.entries(grouped).map(([group, list]) => (
              <GanttFeatureListGroup key={group}>
                {list.map((feature) => (
                  <ContextMenu key={feature.id}>
                    <ContextMenuTrigger asChild>
                      <button type="button">
                        <GanttFeatureItem {...feature}>
                          <p className="flex-1 truncate text-xs">{feature.name}</p>
                          {feature.owner && (
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={feature.owner.image} />
                              <AvatarFallback>{getInitials(feature.owner.name)}</AvatarFallback>
                            </Avatar>
                          )}
                        </GanttFeatureItem>
                      </button>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => console.log('View', feature.id)}>
                        <EyeIcon size={16} /> Ver
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => console.log('Copy', feature.id)}>
                        <LinkIcon size={16} /> Copiar enlace
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => console.log('Remove', feature.id)}>
                        <TrashIcon size={16} /> Eliminar
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </GanttFeatureListGroup>
            ))}
          </GanttFeatureList>
          <GanttToday />
          <GanttCreateMarkerTrigger onCreateMarker={(date) => console.log(date)} />
        </GanttTimeline>
      </GanttProvider>
    </div>
  );
}

function mapFeature(f: any): any {
  const start = new Date(f.start_at);
  const end = f.end_at ? new Date(f.end_at) : null;

  if (isNaN(start.getTime())) {
    console.error('Invalid startAt:', f.start_at);
    throw new Error('Invalid startAt');
  }

  return {
    id: f.id,
    name: f.name,
    startAt: start,
    endAt: end,
    status: f.status ?? { id: 'default', name: 'Sin estado', color: '#888' },
    group: f.group_info ?? { id: 'default', name: 'Sin grupo' },
    product: f.product ?? { id: 'default', name: 'Sin producto' },
    owner: f.owner
      ? {
        id: f.owner.id || 'default',
        name: f.owner.name,
        image: f.owner.avatar, 
      }
      : {
        id: 'default',
        name: 'Sin dueño',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=anon',
      },

    initiative: f.initiative ?? { id: 'default', name: 'Ninguna' },
    release: f.release ?? { id: 'default', name: 'Ninguna' },
  };
}