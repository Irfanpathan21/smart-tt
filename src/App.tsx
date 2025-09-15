import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { BookOpen, Users, Building, Calendar, Zap } from 'lucide-react';
import { CourseManager, type Course } from './components/CourseManager';
import { FacultyManager, type Faculty } from './components/FacultyManager';
import { ClassroomManager, type Classroom } from './components/ClassroomManager';
import { ScheduleGenerator, type ScheduleItem } from './components/ScheduleGenerator';
import { ScheduleViewer } from './components/ScheduleViewer';

// Sample data to demonstrate the system
const SAMPLE_COURSES: Course[] = [
  {
    id: '1',
    name: 'Introduction to Computer Science',
    code: 'CS101',
    credits: 3,
    year: 'FY',
    assignedTeacherId: '1',
    prerequisites: [],
    requiredResources: ['Computer Lab', 'Projector'],
    enrollmentLimit: 30,
    duration: 3
  },
  {
    id: '2',
    name: 'Data Structures and Algorithms',
    code: 'CS201',
    credits: 4,
    year: 'SY',
    assignedTeacherId: '1',
    prerequisites: ['CS101'],
    requiredResources: ['Computer Lab', 'Whiteboard'],
    enrollmentLimit: 25,
    duration: 3
  },
  {
    id: '3',
    name: 'Calculus I',
    code: 'MATH101',
    credits: 4,
    year: 'FY',
    assignedTeacherId: '2',
    prerequisites: [],
    requiredResources: ['Whiteboard'],
    enrollmentLimit: 40,
    duration: 3
  },
  {
    id: '4',
    name: 'Physics I',
    code: 'PHY101',
    credits: 3,
    year: 'FY',
    assignedTeacherId: '2',
    prerequisites: [],
    requiredResources: ['Science Lab', 'Projector'],
    enrollmentLimit: 35,
    duration: 3
  },
  {
    id: '5',
    name: 'Advanced Programming',
    code: 'CS301',
    credits: 4,
    year: 'TY',
    assignedTeacherId: '1',
    prerequisites: ['CS201'],
    requiredResources: ['Computer Lab'],
    enrollmentLimit: 20,
    duration: 3
  },
  {
    id: '6',
    name: 'Statistics',
    code: 'MATH201',
    credits: 3,
    year: 'SY',
    assignedTeacherId: '2',
    prerequisites: ['MATH101'],
    requiredResources: ['Whiteboard'],
    enrollmentLimit: 30,
    duration: 3
  }
];

const SAMPLE_FACULTY: Faculty[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    department: 'Computer Science',
    specializations: ['Computer Science', 'Programming', 'Algorithms'],
    maxHoursPerWeek: 12,
    availability: {
      Monday: ['9:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00'],
      Tuesday: ['9:00-10:00', '10:00-11:00', '13:00-14:00', '14:00-15:00'],
      Wednesday: ['9:00-10:00', '10:00-11:00', '11:00-12:00'],
      Thursday: ['10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'],
      Friday: ['9:00-10:00', '10:00-11:00', '11:00-12:00']
    }
  },
  {
    id: '2',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@university.edu',
    department: 'Mathematics',
    specializations: ['Mathematics', 'Calculus', 'Statistics'],
    maxHoursPerWeek: 15,
    availability: {
      Monday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '13:00-14:00', '14:00-15:00'],
      Tuesday: ['8:00-9:00', '9:00-10:00', '15:00-16:00', '16:00-17:00'],
      Wednesday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '13:00-14:00'],
      Thursday: ['8:00-9:00', '9:00-10:00', '13:00-14:00', '14:00-15:00'],
      Friday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00']
    }
  }
];

const SAMPLE_CLASSROOMS: Classroom[] = [
  {
    id: '1',
    name: 'Room 101',
    building: 'Computer Science Building',
    capacity: 35,
    type: 'Lab',
    resources: ['Computer Lab', 'Projector', 'Whiteboard', 'Air Conditioning'],
    availability: {
      Monday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'],
      Tuesday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'],
      Wednesday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00'],
      Thursday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'],
      Friday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00']
    }
  },
  {
    id: '2',
    name: 'Lecture Hall A',
    building: 'Main Academic Building',
    capacity: 50,
    type: 'Lecture Hall',
    resources: ['Projector', 'Audio System', 'Whiteboard', 'Microphone'],
    availability: {
      Monday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'],
      Tuesday: ['8:00-9:00', '9:00-10:00', '11:00-12:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'],
      Wednesday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00'],
      Thursday: ['8:00-9:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00'],
      Friday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00']
    }
  },
  {
    id: '3',
    name: 'Science Lab 1',
    building: 'Science Building',
    capacity: 40,
    type: 'Lab',
    resources: ['Science Lab', 'Projector', 'Whiteboard', 'Safety Equipment'],
    availability: {
      Monday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00'],
      Tuesday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'],
      Wednesday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00'],
      Thursday: ['8:00-9:00', '9:00-10:00', '11:00-12:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'],
      Friday: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00']
    }
  }
];

export default function App() {
  const [courses, setCourses] = useState<Course[]>(SAMPLE_COURSES);
  const [faculty, setFaculty] = useState<Faculty[]>(SAMPLE_FACULTY);
  const [classrooms, setClassrooms] = useState<Classroom[]>(SAMPLE_CLASSROOMS);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  const handleScheduleGenerated = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1>Automated Class Scheduling Optimizer</h1>
              <p className="text-muted-foreground">
                Optimize your academic schedule with intelligent constraint resolution
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-2xl font-bold">{courses.length}</div>
                <div className="text-muted-foreground">Total Courses</div>
                <div className="text-sm text-muted-foreground mt-1">
                  FY: {courses.filter(c => c.year === 'FY').length} | 
                  SY: {courses.filter(c => c.year === 'SY').length} | 
                  TY: {courses.filter(c => c.year === 'TY').length}
                </div>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-2xl font-bold">{faculty.length}</div>
                <div className="text-muted-foreground">Faculty Members</div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-2xl font-bold">{classrooms.length}</div>
                <div className="text-muted-foreground">Classrooms</div>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-2xl font-bold">{schedule.length}</div>
                <div className="text-muted-foreground">Scheduled Classes</div>
                <div className="text-sm text-muted-foreground mt-1">
                  FY: {schedule.filter(s => s.year === 'FY').length} | 
                  SY: {schedule.filter(s => s.year === 'SY').length} | 
                  TY: {schedule.filter(s => s.year === 'TY').length}
                </div>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Schedule Management System
              <div className="flex gap-2">
                <Badge variant="secondary">Academic Year System</Badge>
                <Badge variant="outline">FY | SY | TY</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="courses" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Courses
                </TabsTrigger>
                <TabsTrigger value="faculty" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Faculty
                </TabsTrigger>
                <TabsTrigger value="classrooms" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Classrooms
                </TabsTrigger>
                <TabsTrigger value="generator" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  View Schedule
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="mt-6">
                <CourseManager courses={courses} faculty={faculty} onCoursesChange={setCourses} />
              </TabsContent>

              <TabsContent value="faculty" className="mt-6">
                <FacultyManager faculty={faculty} onFacultyChange={setFaculty} />
              </TabsContent>

              <TabsContent value="classrooms" className="mt-6">
                <ClassroomManager classrooms={classrooms} onClassroomsChange={setClassrooms} />
              </TabsContent>

              <TabsContent value="generator" className="mt-6">
                <ScheduleGenerator
                  courses={courses}
                  faculty={faculty}
                  classrooms={classrooms}
                  onScheduleGenerated={handleScheduleGenerated}
                />
              </TabsContent>

              <TabsContent value="schedule" className="mt-6">
                <ScheduleViewer
                  schedule={schedule}
                  courses={courses}
                  faculty={faculty}
                  classrooms={classrooms}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4>Constraint Management</h4>
                <p className="text-sm text-muted-foreground">
                  Handle complex scheduling constraints including faculty availability, room capacity, and resource requirements.
                </p>
              </div>
              <div className="space-y-2">
                <h4>Conflict Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically detect and report scheduling conflicts with detailed analysis and resolution suggestions.
                </p>
              </div>
              <div className="space-y-2">
                <h4>Resource Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Optimize classroom usage and ensure required resources are available for each scheduled class.
                </p>
              </div>
              <div className="space-y-2">
                <h4>Prerequisites Handling</h4>
                <p className="text-sm text-muted-foreground">
                  Manage course prerequisites and ensure logical course sequencing for student academic progression.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}