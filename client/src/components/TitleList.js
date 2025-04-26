import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Pagination,
} from '@mui/material';
import axios from 'axios';

function TitleList() {
  const [titles, setTitles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [directorFilter, setDirectorFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTitles();
  }, [page, searchQuery, directorFilter, ratingFilter, sortBy, sortOrder]);

  const fetchTitles = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/titles', {
        params: {
          page,
          limit: 20,
          search: searchQuery,
          director: directorFilter,
          rating: ratingFilter,
          sortBy,
          sortOrder
        }
      });
      setTitles(response.data.titles);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching titles:', error);
    }
  };

  const handleTitleClick = (id) => {
    navigate(`/title/${id}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Director"
          variant="outlined"
          value={directorFilter}
          onChange={(e) => setDirectorFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Rating</InputLabel>
          <Select
            value={ratingFilter}
            label="Rating"
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="TV-MA">TV-MA</MenuItem>
            <MenuItem value="TV-14">TV-14</MenuItem>
            <MenuItem value="TV-PG">TV-PG</MenuItem>
            <MenuItem value="R">R</MenuItem>
            <MenuItem value="PG-13">PG-13</MenuItem>
            <MenuItem value="PG">PG</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="release_year">Release Year</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort Order</InputLabel>
          <Select
            value={sortOrder}
            label="Sort Order"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {titles.map((title) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={title.show_id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
              onClick={() => handleTitleClick(title.show_id)}
            >
              <CardMedia
                component="img"
                height="140"
                image={`https://source.unsplash.com/random/300x200?${title.title}`}
                alt={title.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
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

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
        <Pagination
          count={pagination.totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
        />
      </Box>
    </Box>
  );
}

export default TitleList; 