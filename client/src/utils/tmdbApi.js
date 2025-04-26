import axios from 'axios';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const searchMovie = async (title, year) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title,
        year: year,
        language: 'en-US',
        include_adult: false
      }
    });

    if (response.data.results.length > 0) {
      return response.data.results[0];
    }
    return null;
  } catch (error) {
    console.error('Error searching movie:', error);
    return null;
  }
};

export const searchTVShow = async (title, year) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title,
        first_air_date_year: year,
        language: 'en-US',
        include_adult: false
      }
    });

    if (response.data.results.length > 0) {
      return response.data.results[0];
    }
    return null;
  } catch (error) {
    console.error('Error searching TV show:', error);
    return null;
  }
};

export const getPosterUrl = (posterPath, size = 'w500') => {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
};

export const getBackdropUrl = (backdropPath, size = 'w500') => {
  if (!backdropPath) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
}; 