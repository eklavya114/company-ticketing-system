export default function ClientDashboard() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get('/tickets/my-tickets')
      .then(res => setTickets(res.data.tickets || []));
  }, []);

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="My Tickets" value={tickets.length} />
      </div>

      <div className="flex gap-4 mt-4">
        <Link to="/client/create" className="btn-primary">
          Create Ticket
        </Link>
        <Link to="/client/tickets" className="btn-secondary">
          View My Tickets
        </Link>
      </div>

      <RecentList title="Recent Tickets" items={tickets} />
    </>
  );
}
