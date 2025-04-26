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
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:3001/api/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecommendations(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [navigate]);

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
        Your Personalized Recommendations
      </Typography>
      
      {recommendations.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
          Start adding favorites and reviews to get personalized recommendations!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {recommendations.map((title) => (
            <Grid item xs={12} sm={6} md={4} key={title.show_id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleTitleClick(title.show_id)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={`https://source.unsplash.com/featured/?${encodeURIComponent(title.title)}`}
                  alt={title.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {title.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {title.type} • {title.release_year}
                  </Typography>
                  <Box sx={{ mt: 1, mb: 1 }}>
                    {title.listed_in.split(', ').map((genre) => (
                      <Chip 
                        key={genre} 
                        label={genre} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {title.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mb: 1 }}>
                    <Rating 
                      value={title.avg_rating || 0} 
                      precision={0.5} 
                      readOnly 
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {title.avg_rating ? title.avg_rating.toFixed(1) : 'No ratings'}
                    </Typography>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default RecommendationsPage; 