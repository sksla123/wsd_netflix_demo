import axios from 'axios';

export async function getMovieDatas(url) {
    try {
        const response = await axios.get(url);
        const data = response.data;
        const movies = processMovieData(data);
        return movies;
    } catch (error) {
        console.error("Error fetching movie data:", error);
        return [];
    }
}

export function processMovieData(data) {
    let movies = [];

    if (Array.isArray(data.results)) {
        // 리스트로 돌아오는 경우
        movies = data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            originalTitle: movie.original_title,
            overview: movie.overview,
            posterPath: movie.poster_path,
            backdropPath: movie.backdrop_path,
            releaseDate: movie.release_date,
            voteAverage: movie.vote_average,
            voteCount: movie.vote_count,
            popularity: movie.popularity,
            genreIds: movie.genre_ids
        }));
    } else if (data.id) {
        // 단일 영화인 경우
        movies.push({
            id: data.id,
            title: data.title,
            originalTitle: data.original_title,
            overview: data.overview,
            posterPath: data.poster_path,
            backdropPath: data.backdrop_path,
            releaseDate: data.release_date,
            voteAverage: data.vote_average,
            voteCount: data.vote_count,
            popularity: data.popularity,
            genreIds: data.genre_ids
        });
    }

    return movies;
}

export function processMovieAndMetaData(data) {
    const movies = processMovieData(data);

    return {
        movies,
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results
    };
}