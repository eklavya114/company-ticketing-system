
export default function TeamLeadDashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get('/tl/team-lead/assignments')
      .then(res => setTasks(res.data.assignments || []));
  }, []);

  const inProgress = tasks.filter(t => t.status === 'In Progress');

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="My Tasks" value={tasks.length} />
        <StatCard title="In Progress" value={inProgress.length} />
      </div>

      <Link to="/teamlead" className="btn-primary mt-4 inline-block">
        Open My Tasks
      </Link>
    </>
  );
}