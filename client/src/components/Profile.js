import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Chip,
} from '@mui/material';
import axios from 'axios';

function Profile({ user }) {
  const [tabValue, setTabValue] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (tabValue === 0) {
        const response = await axios.get('http://localhost:3001/api/reviews/user', { headers });
        setReviews(response.data);
      } else {
        const response = await axios.get('http://localhost:3001/api/favorites', { headers });
        setFavorites(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [tabValue]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {user.username}!
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="My Reviews" />
          <Tab label="My Favorites" />
        </Tabs>
      </Box>

      {tabValue === 0 ? (
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {review.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="body1">{review.review}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((title) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={title.show_id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={`https://source.unsplash.com/random/300x200?${title.title}`}
                  alt={title.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {title.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {title.type} • {title.release_year}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={title.rating}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {title.director && (
                      <Typography variant="body2" color="text.secondary">
                        Director: {title.director}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Profile; 