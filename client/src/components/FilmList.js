import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box,
  Rating,
  Chip,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const FilmList = ({ 
  films, 
  onTitleClick, 
  onRemoveFavorite, 
  showRemoveButton = false,
  imageHeight = 200
}) => {
  return (
    <Grid container spacing={3}>
      {films.map((title) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={title.show_id}>
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
            <CardMedia
              component="img"
              height={imageHeight}
              image={`https://placehold.co/600x400?${encodeURIComponent(title.title)}`}
              alt={title.title}
              onClick={() => onTitleClick(title.show_id)}
              sx={{
                objectFit: 'cover',
                aspectRatio: '2/3',
                width: '100%'
              }}
            />
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
                {showRemoveButton && (
                  <IconButton 
                    color="error" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(title.show_id);
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
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default FilmList; 