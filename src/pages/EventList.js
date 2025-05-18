import React, { useEffect, useState } from 'react';
import API from '../api';
import {
  Container, Row, Col, Card, Button, Spinner, Alert, Pagination, Badge, Form, Modal
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const EventList = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventRes = await API.get(`/events?page=${page}&limit=8`);
        setEvents(eventRes.data.events);
        setPages(eventRes.data.pages);

        if (token) {
          const bookingRes = await API.get('/bookings/my', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserBookings(bookingRes.data);
        }
      } catch (err) {
        console.error(err);
        setError(t('Failed to load data.'));
        toast.error(t('Failed to load data.'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [token, page, t]);

  const handleBook = async (eventId) => {
    if (!token) {
      toast.info(t('Please log in to book events.'));
      navigate('/login');
      return;
    }

    setBookingId(eventId);

    try {
      await API.post(
        '/bookings',
        { eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('Booked successfully!'));

      const bookingRes = await API.get('/bookings/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserBookings(bookingRes.data);

      const bookedEvent = events.find(e => e._id === eventId);
      navigate('/congratulations', { state: { event: bookedEvent } });
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error(err.response?.data?.msg || t('Booking failed.'));
    } finally {
      setBookingId(null);
    }
  };

  const renderPagination = () => {
    let items = [];
    for (let number = 1; number <= pages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>
          {number}
        </Pagination.Item>
      );
    }
    return <Pagination>{items}</Pagination>;
  };

  // Get unique categories
  const uniqueCategories = ['All', ...new Set(events.map(e => e.category))];

  // Filtered events based on selected category
  const filteredEvents = selectedCategory === 'All'
    ? events
    : events.filter(e => e.category === selectedCategory);

  const handleCardClick = (evt) => {
    setSelectedEvent(evt);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  // Detect dark mode by checking the body class
  const isDarkMode = document.body.classList.contains('dark-mode');

  // Helper to get image URL from event.image (MongoDB)
  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    if (typeof image === 'string') return image; // fallback for old data
    if (image._id) return `${API_BASE_URL}/api/upload/image/${image._id}`;
    return '/placeholder.jpg';
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-4">
      <h3 className="mb-3">{t("Browse Events")}</h3>
      <Form.Group className="mb-4" controlId="categorySelect">
        <Form.Label>{t("Filter by Category")}</Form.Label>
        <Form.Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {uniqueCategories.map((cat, idx) => (
            <option key={idx} value={cat}>{t(cat)}</option>
          ))}
        </Form.Select>
      </Form.Group>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {filteredEvents.length === 0 ? (
          <p>{t("No events found for this category.")}</p>
        ) : (
          filteredEvents.map(evt => {
            const isBooked = userBookings.some(
              b => b.event && b.event._id === evt._id
            );

            return (
              <Col key={evt._id}>
                <Card
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCardClick(evt)}
                >
                  <Card.Img
                    variant="top"
                    src={getImageUrl(evt.image)}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>{evt.name}</Card.Title>
                    <Card.Text className="text-truncate">{evt.description}</Card.Text>
                    <Card.Text>
                      <small className="text-muted">
                        {new Date(evt.date).toLocaleString()} {t("at")} {evt.venue}
                      </small>
                    </Card.Text>
                    <Card.Text><strong>${evt.price}</strong></Card.Text>
                    <Card.Text>
                      <strong>{t("Category")}:</strong> {evt.category}
                    </Card.Text>
                    <Card.Text>
                      {evt.tags.map(tag => (
                        <Badge key={tag} bg="secondary" className="me-1">{tag}</Badge>
                      ))}
                    </Card.Text>
                    {/* Prevent card click from triggering when clicking the button */}
                    <div onClick={e => e.stopPropagation()}>
                      {isBooked ? (
                        <Button variant="danger" block disabled>
                          {t("Booked")}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleBook(evt._id)}
                          block
                          variant="primary"
                          disabled={bookingId === evt._id}
                        >
                          {bookingId === evt._id ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                              /> {t("Booking...")}
                            </>
                          ) : (
                            t("Book Now")
                          )}
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        )}
      </Row>

      {/* Modal for event details */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        dialogClassName={isDarkMode ? 'dark-mode' : ''}
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <img
                src={getImageUrl(selectedEvent.image)}
                alt={selectedEvent.name}
                style={{ width: '100%', height: 200, objectFit: 'cover', marginBottom: 16 }}
              />
              <p><strong>{t("Description")}:</strong> {selectedEvent.description}</p>
              <p><strong>{t("Date")}:</strong> {new Date(selectedEvent.date).toLocaleString()}</p>
              <p><strong>{t("Venue")}:</strong> {selectedEvent.venue}</p>
              <p><strong>{t("Price")}:</strong> ${selectedEvent.price}</p>
              <p><strong>{t("Category")}:</strong> {selectedEvent.category}</p>
              <p>
                <strong>{t("Tags")}:</strong>{' '}
                {selectedEvent.tags.map(tag => (
                  <Badge key={tag} bg="secondary" className="me-1">{tag}</Badge>
                ))}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("Close")}
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="d-flex justify-content-center mt-4">
        {renderPagination()}
      </div>
    </Container>
  );
};

export default EventList;