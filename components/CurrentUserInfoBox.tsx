import { Avatar, Box, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from "@mui/material";
import React, { FC, useMemo, useState } from "react";
import { CurrentUserInfo, presenceHeartbeat } from "@/lib/api";
import EditIcon from '@mui/icons-material/Edit';

export type CurrentUserInfoBoxProps = {
  currentUserInfo: CurrentUserInfo | null;
  onUserInfoChange: () => void;
}
const CurrentUserInfoBox: FC<CurrentUserInfoBoxProps> = ({ currentUserInfo, onUserInfoChange }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 32;
  }, [name]);

  const onOpenEdit = () => {
    if (!currentUserInfo) return;
    setName(currentUserInfo.name);
    setError(null);
    setEditOpen(true);
  };
  const onCloseEdit = () => {
    if (saving) return;
    setEditOpen(false);
  };
  const onSave = async () => {
    if (!currentUserInfo) return;
    const newName = name.trim();
    if (newName.length < 2 || newName.length > 32) {
      setError('Name must be between 2 and 32 characters.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      // Persist locally so it becomes the default for this user on reload
      localStorage.setItem('userName', newName);
      // Inform server immediately so lists and stats reflect the new name
      await presenceHeartbeat({ userId: currentUserInfo.id, name: newName });
      setEditOpen(false);
      onUserInfoChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save name');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Current User</Typography>
      <List dense>
        {!currentUserInfo ? (
          <ListItem dense disablePadding>
            <ListItemText primary="Loading stats..." />
          </ListItem>
        ) : (
          <ListItem
            dense
            secondaryAction={
              <IconButton edge="end" aria-label="edit name" onClick={onOpenEdit} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar>
                {currentUserInfo.name.at(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${currentUserInfo.name} (you)`}
              secondary={`${currentUserInfo.id} • ${currentUserInfo.count} px • ${(currentUserInfo.percentage * 100).toFixed(2)}%`}
              slotProps={{
                secondary: {
                  sx: { wordBreak: 'break-all' }
                }
              }}
            />
          </ListItem>
        )}
      </List>

      <Dialog open={editOpen} onClose={onCloseEdit} fullWidth maxWidth="xs">
        <DialogTitle>Edit your name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText={error || `${name.trim().length}/32`}
            error={!!error}
            disabled={saving}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseEdit} disabled={saving}>Cancel</Button>
          <Button onClick={onSave} disabled={!canSave || saving} variant="contained">
            {saving ? (<><CircularProgress size={16} sx={{ mr: 1 }} /> Saving...</>) : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CurrentUserInfoBox