import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box,
  Chip,
  Skeleton,
  Rating
} from '@mui/material';
import { searchMovie, searchTVShow, getPosterUrl } from '../utils/tmdbApi';

const TitleCard = ({ 
  title, 
  onTitleClick, 
  imageHeight = 200,
  showDescription = false,
  showGenres = true,
  showRating = true
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const searchFunction = title.type === 'Movie' ? searchMovie : searchTVShow;
        const result = await searchFunction(title.title, title.release_year);
        
        if (result && result.poster_path) {
          setImageUrl(getPosterUrl(result.poster_path));
        } else {
          setImageUrl(`https://placehold.co/600x400/333/fff?text=${encodeURIComponent(title.title)}`);
        }
      } catch (error) {
        console.error(`Error fetching image for ${title.title}:`, error);
        setImageUrl(`https://placehold.co/600x400/333/fff?text=${encodeURIComponent(title.title)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [title]);

  const renderImage = () => {
    if (loading) {
      return (
        <Skeleton 
          variant="rectangular" 
          height={imageHeight} 
          animation="wave"
          sx={{ 
            aspectRatio: '2/3',
            width: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.1)'
          }}
        />
      );
    }

    return (
      <CardMedia
        component="img"
        height={imageHeight}
        image={imageUrl}
        alt={title.title}
        onClick={() => onTitleClick(title.show_id)}
        sx={{
          objectFit: 'cover',
          aspectRatio: '2/3',
          width: '100%',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://placehold.co/600x400/333/fff?text=${encodeURIComponent(title.title)}`;
        }}
      />
    );
  };

  return (
    <Card 
      sx={{ 
        width: '100%',
        maxWidth: '280px',
        margin: '0 auto',
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
      {renderImage()}
      <CardContent 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          width: '100%'
        }} 
        onClick={() => onTitleClick(title.show_id)}
      >
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
            fontSize: '1rem',
            width: '100%'
          }}
        >
          {title.title}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          gutterBottom
          sx={{ mb: 1, fontSize: '0.875rem', width: '100%' }}
        >
          {title.type} • {title.release_year}
        </Typography>
        {showGenres && (
          <Box 
            sx={{ 
              mt: 1, 
              mb: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              width: '100%'
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
        )}
        {showDescription && (
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
              fontSize: '0.875rem',
              width: '100%'
            }}
          >
            {title.description}
          </Typography>
        )}
        {showRating && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 2,
              pt: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              width: '100%'
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
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TitleCard; 