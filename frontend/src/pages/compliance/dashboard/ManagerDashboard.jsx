export default function ManagerDashboard() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    api.get('/department/manager/assignments')
      .then(res => setAssignments(res.data.assignments || []));
  }, []);

  const unassigned = assignments.filter(a => a.status === 'Not Assigned');

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Assignments" value={assignments.length} />
        <StatCard title="Unassigned" value={unassigned.length} />
      </div>

      <Link to="/manager" className="btn-primary mt-4 inline-block">
        Manage Assignments
      </Link>
    </>
  );
}