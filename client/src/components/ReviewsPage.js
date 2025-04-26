import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Button,
  Rating,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:3001/api/reviews/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
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

  const handleEditReview = (reviewId) => {
    // TODO: Implement edit review functionality
    console.log('Edit review:', reviewId);
  };

  const handleTitleClick = (showId) => {
    navigate(`/titles/${showId}`);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Reviews
      </Typography>
      
      {reviews.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
          You haven't written any reviews yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={`https://source.unsplash.com/featured/?${encodeURIComponent(review.title)}`}
                        alt={review.title}
                        onClick={() => handleTitleClick(review.show_id)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        gutterBottom
                        onClick={() => handleTitleClick(review.show_id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {review.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {review.rating} stars
                        </Typography>
                      </Box>
                      <Typography variant="body1" paragraph>
                        {review.review}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reviewed on {new Date(review.created_at).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditReview(review.id)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteReview(review.id)}
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
      )}
    </Container>
  );
};

export default ReviewsPage; 