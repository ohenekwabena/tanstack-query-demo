import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../utils/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {

  const {id} = useParams();
  const navigate = useNavigate()

  const {data, isPending, isError, error} = useQuery({
    queryKey: ["events", {id}],
    queryFn: ({signal}) => fetchEvent({id, signal})
  })

  const {mutate,isPending: deletePending, isError: deleteHasError, error: deleteError} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none"
      })
      
      navigate("/events")
    }
  })

  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    setIsDeleting(true)
  } 

  const stopDeleting = () => {
    setIsDeleting(false)
  }

  

  const onDelete = () => {
    mutate({id})
  }

    let content = " ";
    
    if(isPending){
      content = <div id='event-details-content' className='center'><LoadingIndicator /></div>
    }
    
    if(isError){
      content = <ErrorBlock title="An error occurred" message={error.info?.message || "Failed to load event"} />
    }
    
   if(data){
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })

      content = <> 
     {isDeleting && <Modal onClose={handleDelete}>
        <h2>Are you sure?</h2>
        <p>This action cannot be undone</p>
        <div className='form-actions'>
          {deletePending && <p>Deleting, please wait...</p>}
          {!deletePending && 
          <>
          <button className='button-text' onClick={stopDeleting}>Cancel</button>
          <button className='button' onClick={onDelete}>Delete</button>
          </>
          }
        </div>
        {deleteHasError && <ErrorBlock title="Failed to delete event" message={deleteError?.message || "Please try again later"} />}
      </Modal>}
          <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
      <img src = {`http://localhost:3000/${data.image}`} alt="" />
      <div id="event-details-info">
        <div>
          <p id="event-details-location">{data.location}</p>
          <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
        </div>
        <p id="event-details-description">{data.description}</p>
      </div>
      </div>
        </>
  }


  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
 

        {content}

      </article>
    </>
  );
}
