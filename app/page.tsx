"use client";
import React, { RefObject, useEffect, useRef, useState } from 'react';
import {
  AppBar,
  Box,
  Divider,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  bootstrapCanvas,
  listOnlineUsers,
  listTopConquerors,
  presenceHeartbeat,
  setPixel,
  getCurrentUserInfo,
  useUser,
  User,
  OnlineUser,
  TopUser,
  CurrentUserInfo, useApiStreamMessageListener, useApiStream
} from "@/lib/api";
import GameRulesDialog from "@/components/GameRulesDialog";
import CanvasZoomControl from "@/components/CanvasZoomControl";
import GameColorControl from "@/components/GameColorControl";

import { xyFromIdx } from "@/lib/idx";
import appConfig from "@/appConfig";
import OnlineUsersList from "@/components/OnlineUsersLIst";
import TopUsersList from "@/components/TopUsersList";
import CurrentUserInfoBox from "@/components/CurrentUserInfoBox";
import { useInterval } from "@/lib/interval";
import { clearCanvas, drawPixel } from "@/lib/canvas";

const useHeartbeat = (stream: EventSource | null, user: User | null) => {
  const performHeartbeat = async () => {
    if (!user) return;
    await presenceHeartbeat({ userId: user.id, name: user.name });
  }
  useInterval(performHeartbeat, 3000, true);
  useApiStreamMessageListener(stream, 'presence', performHeartbeat)
}

const useOnlineUsers = () => {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  useInterval(async () => {
    const data = await listOnlineUsers();
    setUsers(data.users || []);
  }, 5000, true);
  return users;
}

const useTopUsers = () => {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  useInterval(async () => {
    const data = await listTopConquerors();
    setTopUsers(data.users || []);
  }, 5000, true);
  return topUsers;
}

const useCurrentUserInfo = (stream: EventSource | null, user: User | null) => {
  const [currentInfo, setCurrentInfo] = useState<CurrentUserInfo | null>(null);
  const updateCurrentInfo = async () => {
    if (!user) return;
    const info = await getCurrentUserInfo(user.id);
    setCurrentInfo(info);
  }
  useInterval(updateCurrentInfo, 5000, !!user);
  useApiStreamMessageListener(stream, 'pixel', updateCurrentInfo)
  return [currentInfo, updateCurrentInfo] as const;
}

const useZoom = (containerRef: RefObject<HTMLElement | null>) => {
  const [zoom, setZoom] = useState(0);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const initialZoom = Math.min(container.getBoundingClientRect().width / appConfig.canvas.width, container.getBoundingClientRect().height / appConfig.canvas.height) - 0.1;
    setZoom(initialZoom);
  }, []);
  return [zoom, setZoom] as const;
}

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLElement | null>(null);
  const user = useUser();
  const [rulesOpen, setRulesOpen] = useState<boolean>(true);
  const [color, setColor] = useState<string>('#ff0000');
  const [bootstrapped, setBootstrapped] = useState<boolean>(false);
  const [zoom, setZoom] = useZoom(canvasContainerRef);

  const onlineUsers = useOnlineUsers();
  const topUsers = useTopUsers();

  const apiStream = useApiStream(user, bootstrapped);
  const [currentUserInfo, reloadCurrentUserInfo] = useCurrentUserInfo(apiStream, user);
  useHeartbeat(apiStream, user);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = appConfig.canvas.width;
    canvas.height = appConfig.canvas.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Fill white
    clearCanvas(ctx)
    // Load existing pixels
    bootstrapCanvas().then((data) => {
      for (const k in data.colors) {
        const idx = parseInt(k, 10);
        const {x, y} = xyFromIdx(idx);
        drawPixel(ctx, x, y, data.colors[k]);
      }
    }).then(() => {
      setBootstrapped(true);
    });
  }, []);

  useApiStreamMessageListener(apiStream, 'pixel', (ev) => {
    const data = JSON.parse(ev.data);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawPixel(ctx, data.x, data.y, data.color);
  })

  const onCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * appConfig.canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * appConfig.canvas.height);
    if (x < 0 || y < 0 || x >= appConfig.canvas.width || y >= appConfig.canvas.height) return;
    await setPixel({ x, y, color, userId: user?.id });
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Redis Pixel War</Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <GameRulesDialog
          open={rulesOpen}
          onClose={() => setRulesOpen(false)}
          onConfirm={() => setRulesOpen(false)}
        />
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Stack
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              gap: 1,
              alignItems: 'flex-end',
            }}
          >
            <GameColorControl
              color={color}
              onColorChange={setColor}
            />
          </Stack>
          <Stack
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              zIndex: 10,
              gap: 1,
              alignItems: 'flex-end',
            }}
          >
            <CanvasZoomControl
              zoom={zoom}
              onZoomChange={setZoom}
            />
          </Stack>
          <Box
            ref={canvasContainerRef}
            sx={{
              flex: 1,
              position: 'relative',
              overflow: 'auto',
              bgcolor: 'background.default',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <Box
              component="canvas"
              ref={canvasRef}
              onClick={onCanvasClick}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${appConfig.canvas.width * zoom}px`,
                height: `${appConfig.canvas.height * zoom}px`,
                imageRendering: 'pixelated', cursor: 'crosshair',
              }}
            />
          </Box>
        </Box>
        <Divider orientation="vertical" />
        <Box sx={{ width: 320, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <OnlineUsersList
            users={onlineUsers}
            currentUser={user}
          />
          <Divider sx={{ my: 2 }} />
          <TopUsersList
            users={topUsers}
            currentUser={user}
          />
          <Divider sx={{ my: 2 }} />
          <CurrentUserInfoBox
            currentUserInfo={currentUserInfo}
            onUserInfoChange={reloadCurrentUserInfo}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Game
