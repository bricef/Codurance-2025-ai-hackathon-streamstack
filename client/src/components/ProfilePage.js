import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  CardMedia,
  Rating,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import EditReviewDialog from './EditReviewDialog';
import FilmList from './FilmList';
import TitleCard from './TitleCard';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch user profile
      const userResponse = await axios.get('http://localhost:3001/api/auth/me', { headers });
      setUser(userResponse.data);

      // Fetch user's reviews
      const reviewsResponse = await axios.get('http://localhost:3001/api/reviews/user', { headers });
      setReviews(reviewsResponse.data);

      // Fetch user's favorites
      const favoritesResponse = await axios.get('http://localhost:3001/api/favorites', { headers });
      setFavorites(favoritesResponse.data);

      // Fetch recommendations
      const recommendationsResponse = await axios.get('http://localhost:3001/api/recommendations', { headers });
      setRecommendations(recommendationsResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete review');
    }
  };

  const handleRemoveFavorite = async (showId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/favorites/${showId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(favorites.filter(fav => fav.show_id !== showId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove favorite');
    }
  };

  const handleTitleClick = (showId) => {
    navigate(`/title/${showId}`);
  };

  const handleEditReview = (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      setEditingReview(review);
      // TODO: Implement edit review functionality
      console.log('Edit review:', review);
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  const handleSaveEdit = async (reviewId, updatedReview) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/reviews/${reviewId}`, updatedReview, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(reviews.map(review => 
        review.id === reviewId ? { ...review, ...updatedReview } : review
      ));
      setEditingReview(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update review');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  const renderRecommendations = () => (
    <FilmList 
      films={recommendations}
      onTitleClick={handleTitleClick}
      imageHeight={300}
    />
  );

  const renderFavorites = () => (
    <FilmList 
      films={favorites}
      onTitleClick={handleTitleClick}
      onRemoveFavorite={handleRemoveFavorite}
      showRemoveButton={true}
      imageHeight={300}
    />
  );

  const renderReviews = () => (
    <Grid container spacing={3}>
      {reviews.map((review) => (
        <Grid item xs={12} key={review.id}>
          <Card 
            sx={{ 
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                boxShadow: 6
              }
            }}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TitleCard
                    title={review}
                    onTitleClick={() => handleTitleClick(review.show_id)}
                    imageHeight={300}
                    showDescription={false}
                    showGenres={false}
                    showRating={false}
                  />
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    onClick={() => handleTitleClick(review.show_id)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    {review.title}
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      gap: 1
                    }}
                  >
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {review.rating} stars
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ ml: 'auto' }}
                    >
                      Reviewed on {new Date(review.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6
                    }}
                  >
                    {review.review}
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end',
                      gap: 1,
                      mt: 2,
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditReview(review.id)}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteReview(review.id)}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h1" gutterBottom>
                Profile
              </Typography>
              <Typography variant="body1" gutterBottom>
                Username: {user?.username}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Email: {user?.email}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleLogout}
                sx={{ mt: 2 }}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Recommendations" />
              <Tab label="Favorites" />
              <Tab label="Reviews" />
            </Tabs>
          </Box>
          
          {activeTab === 0 && (
            <>
              <Typography variant="h4" component="h1" gutterBottom>
                Your Personalized Recommendations
              </Typography>
              {recommendations.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                  Start adding favorites and reviews to get personalized recommendations!
                </Typography>
              ) : (
                renderRecommendations()
              )}
            </>
          )}
          {activeTab === 1 && (
            <>
              <Typography variant="h4" component="h1" gutterBottom>
                Your Favorites
              </Typography>
              {favorites.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                  You haven't added any favorites yet.
                </Typography>
              ) : (
                renderFavorites()
              )}
            </>
          )}
          {activeTab === 2 && (
            <>
              <Typography variant="h4" component="h1" gutterBottom>
                Your Reviews
              </Typography>
              {reviews.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                  You haven't written any reviews yet.
                </Typography>
              ) : (
                renderReviews()
              )}
            </>
          )}
        </Grid>
      </Grid>
      <EditReviewDialog
        open={!!editingReview}
        review={editingReview}
        onClose={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    </Container>
  );
};

export default ProfilePage; 