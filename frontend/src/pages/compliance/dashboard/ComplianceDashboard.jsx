export default function ComplianceDashboard() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    api.get('/admin/compliance/queue')
      .then(res => setQueue(res.data || []));
  }, []);

  const readyToClose = queue.filter(t => t.status === 'Ready to Close');

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="In Review" value={queue.length} />
        <StatCard title="Ready to Close" value={readyToClose.length} />
      </div>

      <Link to="/compliance" className="btn-primary mt-4 inline-block">
        Open Compliance Queue
      </Link>
    </>
  );
}