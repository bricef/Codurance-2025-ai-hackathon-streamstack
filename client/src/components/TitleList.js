import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import axios from 'axios';
import TitleCard from './TitleCard';

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

  const fetchTitles = useCallback(async () => {
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
  }, [page, searchQuery, directorFilter, ratingFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchTitles();
  }, [fetchTitles]);

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
            <TitleCard
              title={title}
              onTitleClick={handleTitleClick}
              imageHeight={300}
              showDescription={true}
              showGenres={true}
              showRating={true}
            />
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