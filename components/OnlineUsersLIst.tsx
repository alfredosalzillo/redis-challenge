import { Avatar, Badge, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import React, { FC } from "react";
import { OnlineUser } from "@/lib/api";

export type OnlineUsersListProps = {
  users: OnlineUser[];
  currentUser: {
    id: string;
  } | null;
}
const OnlineUsersList: FC<OnlineUsersListProps> = ({ currentUser, users }) => {
  return (
    <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6">Online Users ({users.length})</Typography>
      <List sx={{ flex: 1 }} dense>
        {users.map((u) => (
          <ListItem key={u.id} dense disablePadding>
            <ListItemAvatar>
              <Badge color="success" variant="dot">
                <Avatar color="primary">
                  {u.name.at(0)}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText primary={`${u.name}${currentUser && u.id === currentUser.id ? ' (you)' : ''}`} secondary={u.id.slice(0, 8)} />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default OnlineUsersList