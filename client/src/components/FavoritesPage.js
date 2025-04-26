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
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:3001/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
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
        Your Favorites
      </Typography>
      
      {favorites.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
          You haven't added any favorites yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((title) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={title.show_id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 6,
                    cursor: 'pointer'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={`https://source.unsplash.com/featured/?${encodeURIComponent(title.title)}`}
                  alt={title.title}
                  onClick={() => handleTitleClick(title.show_id)}
                  sx={{
                    objectFit: 'cover',
                    aspectRatio: '2/3'
                  }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }} onClick={() => handleTitleClick(title.show_id)}>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="h2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.2,
                      height: '2.4em',
                      fontSize: '1rem'
                    }}
                  >
                    {title.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ mb: 1, fontSize: '0.875rem' }}
                  >
                    {title.type} • {title.release_year}
                  </Typography>
                  <Box 
                    sx={{ 
                      mt: 1, 
                      mb: 1,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 0.5
                    }}
                  >
                    {title.listed_in.split(', ').map((genre) => (
                      <Chip 
                        key={genre} 
                        label={genre} 
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem',
                          height: '24px'
                        }}
                      />
                    ))}
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      flexGrow: 1,
                      fontSize: '0.875rem'
                    }}
                  >
                    {title.description}
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 2,
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating 
                        value={title.avg_rating || 0} 
                        precision={0.5} 
                        readOnly 
                        size="small"
                      />
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ ml: 1, fontSize: '0.875rem' }}
                      >
                        {title.avg_rating ? title.avg_rating.toFixed(1) : 'No ratings'}
                      </Typography>
                    </Box>
                    <IconButton 
                      color="error" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(title.show_id);
                      }}
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
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default FavoritesPage; 