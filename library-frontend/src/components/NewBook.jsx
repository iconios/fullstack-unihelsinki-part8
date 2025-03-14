import { useState } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { ADD_BOOK, ALL_AUTHORS, ALL_BOOKS, ALL_GENRES, BOOK_ADDED } from '../services/queries';
import notification from '../services/notification'


const NewBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [published, setPublished] = useState(0);
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);
  
  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }, { query: ALL_GENRES }],
  });

  useSubscription(BOOK_ADDED, {
    onData({ client, data }) {
      console.log("Subscription data: ", data);
  
      if (!data?.data?.bookAdded) {
        console.error("No bookAdded data received from subscription");
        return;
      }
  
      const bookAdded = data.data.bookAdded;
  
      notification(`${bookAdded.title} by ${bookAdded.author.name} added`);
  
      try {
        client.cache.updateQuery({ query: ALL_BOOKS }, ({existingData}) => {
          if (!existingData || !existingData.allBooks) return { allBooks: [bookAdded] };
  
          const isDuplicate = existingData.allBooks.some((book) => book.id === bookAdded.id);
          if (isDuplicate) return existingData;
  
          return {
            allBooks: [...existingData.allBooks, bookAdded],
          };
        });
  
        // Alternative: Use `cache.modify` if UI does not re-render
        client.cache.modify({
          fields: {
            allBooks(existingBooks = []) {
              const isDuplicate = existingBooks.some((book) => book.id === bookAdded.id);
              if (isDuplicate) return existingBooks;
              return [...existingBooks, bookAdded];
            },
          },
        });
      } catch (error) {
        console.error("Error updating cache:", error);
        notification("Failed to update book list. Please refresh the page.");
      }
    },
  });
  
  const submit = async (event) => {
    event.preventDefault();
    console.log('Received args:', { title, published, author, genres });

    // Check if required fields are present
    if (!title || !author || !published || genres.length === 0) {
      console.error('Missing required fields');
      return;
    }

    try {
      const { data } = await addBook({ 
        variables: { title, author, genres, published },
      });
      console.log('Data successfully created:', data.addBook);
      
      // Reset form fields
      setTitle('');
      setPublished(0);
      setAuthor('');
      setGenres([]);
      setGenre('');
    } catch (error) {
      console.error('Error mutating:', error);
    }
  };

  const addGenre = () => {
    if (genre.trim() !== '') {
      setGenres(genres.concat(genre.toLowerCase()));
      setGenre('');
    } else {
      console.error("Genre can't be empty");
    }
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title <input value={title} onChange={({ target }) => setTitle(target.value)} />
        </div>
        <div>
          author <input value={author} onChange={({ target }) => setAuthor(target.value)} />
        </div>
        <div>
          published <input type="number" value={published} onChange={({ target }) => setPublished(Number(target.value))} />
        </div>
        <div>
          <input value={genre} onChange={({ target }) => setGenre(target.value)} />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
