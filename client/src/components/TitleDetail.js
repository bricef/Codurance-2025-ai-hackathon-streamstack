import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Rating,
  TextField,
  Button,
  Divider,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
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

  useEffect(() => {
    fetchTitleDetails();
    fetchReviews();
  }, [id]);

  const fetchTitleDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/titles/${id}`);
      setTitle(response.data);
    } catch (error) {
      console.error('Error fetching title details:', error);
    }
  };

  const fetchReviews = async () => {
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
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/reviews', {
        show_id: id,
        rating: newReview.rating,
        review: newReview.review,
      });
      setNewReview({ rating: 0, review: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
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
              src={`https://source.unsplash.com/random/400x600?${title.title}`}
              alt={title.title}
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {title.title}
            </Typography>
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
                    {new Date(review.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="body1">{review.review}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default TitleDetail; 