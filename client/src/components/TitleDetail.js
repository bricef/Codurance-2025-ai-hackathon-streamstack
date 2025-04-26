import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Rating,
  TextField,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import axios from 'axios';

function TitleDetail() {
  const { id } = useParams();
  const [title, setTitle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newReview, setNewReview] = useState({
    rating: 0,
    review: '',
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchTitleDetails = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/titles/${id}`);
      setTitle(response.data);
    } catch (error) {
      console.error('Error fetching title details:', error);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const [reviewsResponse, averageResponse] = await Promise.all([
        axios.get(`http://localhost:3001/api/reviews/${id}`),
        axios.get(`http://localhost:3001/api/reviews/${id}/average`),
      ]);
      setReviews(reviewsResponse.data);
      setAverageRating(averageResponse.data.average_rating || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [id]);

  const checkFavoriteStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`http://localhost:3001/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFavorite(response.data.some(fav => fav.show_id === id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchTitleDetails();
    fetchReviews();
    checkFavoriteStatus();
  }, [fetchTitleDetails, fetchReviews, checkFavoriteStatus]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Please login to submit a review',
        severity: 'error',
      });
      return;
    }

    try {
      await axios.post(
        'http://localhost:3001/api/reviews',
        {
          show_id: id,
          rating: newReview.rating,
          review: newReview.review,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewReview({ rating: 0, review: '' });
      fetchReviews();
      setSnackbar({
        open: true,
        message: 'Review submitted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting review',
        severity: 'error',
      });
    }
  };

  const handleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Please login to add favorites',
        severity: 'error',
      });
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`http://localhost:3001/api/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          'http://localhost:3001/api/favorites',
          { show_id: id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      setIsFavorite(!isFavorite);
      setSnackbar({
        open: true,
        message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating favorite status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating favorite status',
        severity: 'error',
      });
    }
  };

  if (!title) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <img
              src={`https://placehold.co/600x400?${title.title}`}
              alt={title.title}
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h4" gutterBottom>
                {title.title}
              </Typography>
              <IconButton onClick={handleFavorite} color="primary">
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Chip label={title.type} sx={{ mr: 1 }} />
              <Chip label={title.rating} sx={{ mr: 1 }} />
              <Chip label={title.release_year} />
            </Box>
            <Typography variant="body1" paragraph>
              {title.description}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Director: {title.director || 'Unknown'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Cast: {title.cast || 'Unknown'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Country: {title.country || 'Unknown'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Duration: {title.duration}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Average Rating
              </Typography>
              <Rating value={averageRating} readOnly precision={0.5} />
              <Typography variant="body2" color="text.secondary">
                ({reviews.length} reviews)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add a Review
        </Typography>
        <form onSubmit={handleSubmitReview}>
          <Box sx={{ mb: 2 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              value={newReview.rating}
              onChange={(event, newValue) => {
                setNewReview({ ...newReview, rating: newValue });
              }}
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review"
            value={newReview.review}
            onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!newReview.rating || !newReview.review}
          >
            Submit Review
          </Button>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Reviews
      </Typography>
      <Grid container spacing={2}>
        {reviews.map((review) => (
          <Grid item xs={12} key={review.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {review.username ? `by ${review.username}` : 'Anonymous'} •{' '}
                    {new Date(review.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="body1">{review.review}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TitleDetail; 