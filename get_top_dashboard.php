<?php
header('Content-Type: application/json');
require_once 'dbconfig.php';

// 2. Get the student ID from URL safely (defaults to 1)
$studentId = 1;
if (isset($_GET['student_id'])) {
    $studentId = (int)$_GET['student_id'];
}

// 3. Write the exact same query
$query = "SELECT s.name, s.study_streak, s.average_score, 
                 g.goal_title, g.current_stage_name, g.progress_percentage, g.status,
                 m.mission_text
          FROM students s
          LEFT JOIN student_goals g ON s.student_id = g.student_id AND g.status = 'Active'
          LEFT JOIN daily_missions m ON s.student_id = m.student_id AND m.assigned_date = CURRENT_DATE
          WHERE s.student_id = $studentId LIMIT 1";

// 4. Run the query and fetch data
$result = mysqli_query($conn, $query);
$data = mysqli_fetch_assoc($result);

// 5. Output response as JSON so JavaScript can read it
header('Content-Type: application/json');
if ($data) {
    echo json_encode(['success' => true, 'data' => $data]);
} else {
    echo json_encode(['success' => false, 'message' => 'Student data not found.']);
}
?>