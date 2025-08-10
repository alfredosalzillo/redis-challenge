import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import React, { FC } from "react";
import { TopUser } from "@/lib/api";

export type TopUsersListProps = {
  users: TopUser[];
  currentUser: {
    id: string;
  } | null;
}
const TopUsersList: FC<TopUsersListProps> = ({ users, currentUser }) => {
  return (
    <Box>
      <Typography variant="h6">Top Conquerors</Typography>
      <List dense>
        {users.length === 0 && (
          <ListItem dense disablePadding>
            <ListItemText primary="No pixels conquered yet" />
          </ListItem>
        )}
        {users.map((u, idx) => (
          <ListItem key={u.id} dense disablePadding>
            <ListItemAvatar>
              <Avatar>
                {idx + 1}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${u.name}${currentUser && u.id === currentUser.id ? ' (you)' : ''}`}
              secondary={`${u.count} px • ${(u.percentage * 100).toFixed(2)}%`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default TopUsersList