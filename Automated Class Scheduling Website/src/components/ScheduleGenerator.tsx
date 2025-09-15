import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Play, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { Course } from './CourseManager';
import type { Faculty } from './FacultyManager';
import type { Classroom } from './ClassroomManager';

export interface ScheduleItem {
  id: string;
  courseId: string;
  facultyId: string;
  classroomId: string;
  day: string;
  timeSlot: string;
  year: 'FY' | 'SY' | 'TY';
  conflicts: string[];
}

interface ScheduleGeneratorProps {
  courses: Course[];
  faculty: Faculty[];
  classrooms: Classroom[];
  onScheduleGenerated: (schedule: ScheduleItem[]) => void;
}

interface Constraint {
  type: 'error' | 'warning';
  message: string;
  severity: number;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
  '16:00-17:00', '17:00-18:00'
];

export function ScheduleGenerator({ courses, faculty, classrooms, onScheduleGenerated }: ScheduleGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleItem[]>([]);
  const [stats, setStats] = useState<{
    totalSlots: number;
    scheduledSlots: number;
    conflicts: number;
    efficiency: number;
    byYear: {
      FY: { scheduled: number; total: number };
      SY: { scheduled: number; total: number };
      TY: { scheduled: number; total: number };
    };
  }>({ 
    totalSlots: 0, 
    scheduledSlots: 0, 
    conflicts: 0, 
    efficiency: 0,
    byYear: {
      FY: { scheduled: 0, total: 0 },
      SY: { scheduled: 0, total: 0 },
      TY: { scheduled: 0, total: 0 }
    }
  });

  const validateConstraints = (): Constraint[] => {
    const constraints: Constraint[] = [];

    // Check if we have data
    if (courses.length === 0) {
      constraints.push({ type: 'error', message: 'No courses defined', severity: 10 });
    }
    if (faculty.length === 0) {
      constraints.push({ type: 'error', message: 'No faculty members defined', severity: 10 });
    }
    if (classrooms.length === 0) {
      constraints.push({ type: 'error', message: 'No classrooms defined', severity: 10 });
    }

    // Check course prerequisites
    courses.forEach(course => {
      course.prerequisites.forEach(prereq => {
        const prereqExists = courses.some(c => c.code === prereq);
        if (!prereqExists) {
          constraints.push({
            type: 'warning',
            message: `Course ${course.code} references non-existent prerequisite: ${prereq}`,
            severity: 5
          });
        }
      });
    });

    // Check assigned teachers exist
    courses.forEach(course => {
      const assignedTeacher = faculty.find(f => f.id === course.assignedTeacherId);
      if (!assignedTeacher) {
        constraints.push({
          type: 'error',
          message: `Course ${course.code} has no assigned teacher`,
          severity: 9
        });
      }
    });

    // Check classroom capacity vs course enrollment
    courses.forEach(course => {
      const suitableRooms = classrooms.filter(room => 
        room.capacity >= course.enrollmentLimit &&
        course.requiredResources.every(resource => room.resources.includes(resource))
      );
      if (suitableRooms.length === 0) {
        constraints.push({
          type: 'error',
          message: `No suitable classroom for ${course.code} (needs ${course.enrollmentLimit} seats and resources: ${course.requiredResources.join(', ')})`,
          severity: 8
        });
      }
    });

    // Check faculty availability
    faculty.forEach(facultyMember => {
      const totalAvailableHours = DAYS.reduce((total, day) => {
        return total + (facultyMember.availability[day]?.length || 0);
      }, 0);
      
      if (totalAvailableHours < facultyMember.maxHoursPerWeek) {
        constraints.push({
          type: 'warning',
          message: `${facultyMember.name} has only ${totalAvailableHours} available time slots but can teach ${facultyMember.maxHoursPerWeek} hours per week`,
          severity: 3
        });
      }
    });

    return constraints.sort((a, b) => b.severity - a.severity);
  };

  const generateSchedule = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    const validationConstraints = validateConstraints();
    setConstraints(validationConstraints);

    const hasErrors = validationConstraints.some(c => c.type === 'error');
    if (hasErrors) {
      setIsGenerating(false);
      return;
    }

    // Simulate optimization process
    const schedule: ScheduleItem[] = [];
    let totalAttempts = courses.length * 5; // Simulate multiple attempts per course
    let currentAttempt = 0;

    for (const course of courses) {
      // Use the assigned teacher for this course
      const assignedTeacher = faculty.find(f => f.id === course.assignedTeacherId);
      if (!assignedTeacher) {
        continue; // Skip if no teacher assigned
      }

      // Find suitable classrooms
      const suitableRooms = classrooms.filter(room => 
        room.capacity >= course.enrollmentLimit &&
        course.requiredResources.every(resource => room.resources.includes(resource))
      );

      let scheduled = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!scheduled && attempts < maxAttempts) {
        attempts++;
        currentAttempt++;
        setProgress((currentAttempt / totalAttempts) * 100);

        const randomRoom = suitableRooms[Math.floor(Math.random() * suitableRooms.length)];
        const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];

        // Check faculty availability
        const facultyAvailable = assignedTeacher.availability[randomDay] || [];
        const roomAvailable = randomRoom.availability[randomDay] || [];
        const commonSlots = facultyAvailable.filter(slot => roomAvailable.includes(slot));

        if (commonSlots.length > 0) {
          const randomSlot = commonSlots[Math.floor(Math.random() * commonSlots.length)];
          
          // Check for conflicts
          const conflicts: string[] = [];
          const existingScheduleItem = schedule.find(item => 
            (item.facultyId === assignedTeacher.id && item.day === randomDay && item.timeSlot === randomSlot) ||
            (item.classroomId === randomRoom.id && item.day === randomDay && item.timeSlot === randomSlot) ||
            (item.year === course.year && item.day === randomDay && item.timeSlot === randomSlot) // Check for year conflicts
          );

          if (existingScheduleItem) {
            if (existingScheduleItem.facultyId === assignedTeacher.id) {
              conflicts.push('Faculty double-booked');
            }
            if (existingScheduleItem.classroomId === randomRoom.id) {
              conflicts.push('Classroom double-booked');
            }
            if (existingScheduleItem.year === course.year) {
              conflicts.push(`${course.year} students have another class`);
            }
          }

          // Add to schedule even with conflicts (for demonstration)
          const scheduleItem: ScheduleItem = {
            id: `${course.id}-${Date.now()}-${Math.random()}`,
            courseId: course.id,
            facultyId: assignedTeacher.id,
            classroomId: randomRoom.id,
            day: randomDay,
            timeSlot: randomSlot,
            year: course.year,
            conflicts
          };

          schedule.push(scheduleItem);
          scheduled = true;
        }

        // Small delay for animation
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    setGeneratedSchedule(schedule);
    onScheduleGenerated(schedule);

    // Calculate stats
    const totalPossibleSlots = courses.length;
    const scheduledSlots = schedule.length;
    const conflictCount = schedule.reduce((count, item) => count + item.conflicts.length, 0);
    const efficiency = totalPossibleSlots > 0 ? (scheduledSlots / totalPossibleSlots) * 100 : 0;

    // Calculate stats by year
    const fyTotal = courses.filter(c => c.year === 'FY').length;
    const syTotal = courses.filter(c => c.year === 'SY').length;
    const tyTotal = courses.filter(c => c.year === 'TY').length;
    
    const fyScheduled = schedule.filter(s => s.year === 'FY').length;
    const syScheduled = schedule.filter(s => s.year === 'SY').length;
    const tyScheduled = schedule.filter(s => s.year === 'TY').length;

    setStats({
      totalSlots: totalPossibleSlots,
      scheduledSlots,
      conflicts: conflictCount,
      efficiency,
      byYear: {
        FY: { scheduled: fyScheduled, total: fyTotal },
        SY: { scheduled: syScheduled, total: syTotal },
        TY: { scheduled: tyScheduled, total: tyTotal }
      }
    });

    setProgress(100);
    setIsGenerating(false);
  };

  const getCourse = (courseId: string) => courses.find(c => c.id === courseId);
  const getFaculty = (facultyId: string) => faculty.find(f => f.id === facultyId);
  const getClassroom = (classroomId: string) => classrooms.find(r => r.id === classroomId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {constraints.length > 0 && (
            <div className="space-y-2">
              <h4>Constraint Analysis</h4>
              {constraints.slice(0, 5).map((constraint, index) => (
                <Alert key={index} variant={constraint.type === 'error' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{constraint.message}</AlertDescription>
                </Alert>
              ))}
              {constraints.length > 5 && (
                <p className="text-muted-foreground text-sm">
                  + {constraints.length - 5} more constraints...
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{courses.length}</div>
              <div className="text-sm text-muted-foreground">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{faculty.length}</div>
              <div className="text-sm text-muted-foreground">Faculty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{classrooms.length}</div>
              <div className="text-sm text-muted-foreground">Classrooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{DAYS.length * TIME_SLOTS.length}</div>
              <div className="text-sm text-muted-foreground">Time Slots</div>
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating optimal schedule...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button 
            onClick={generateSchedule} 
            disabled={isGenerating || constraints.some(c => c.type === 'error')}
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating Schedule...' : 'Generate Optimal Schedule'}
          </Button>
        </CardContent>
      </Card>

      {generatedSchedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Schedule Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.scheduledSlots}</div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.conflicts}</div>
                <div className="text-sm text-muted-foreground">Conflicts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(stats.efficiency)}%</div>
                <div className="text-sm text-muted-foreground">Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalSlots - stats.scheduledSlots}</div>
                <div className="text-sm text-muted-foreground">Unscheduled</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats.byYear.FY.scheduled}/{stats.byYear.FY.total}</div>
                <div className="text-sm text-muted-foreground">First Year (FY)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{stats.byYear.SY.scheduled}/{stats.byYear.SY.total}</div>
                <div className="text-sm text-muted-foreground">Second Year (SY)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{stats.byYear.TY.scheduled}/{stats.byYear.TY.total}</div>
                <div className="text-sm text-muted-foreground">Third Year (TY)</div>
              </div>
            </div>

            <Tabs defaultValue="list" className="w-full">
              <TabsList>
                <TabsTrigger value="list">Schedule List</TabsTrigger>
                <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="space-y-2">
                {generatedSchedule.map(item => {
                  const course = getCourse(item.courseId);
                  const facultyMember = getFaculty(item.facultyId);
                  const classroom = getClassroom(item.classroomId);
                  
                  return (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.day}</Badge>
                          <Badge variant="secondary">{item.timeSlot}</Badge>
                          <span className="font-medium">{course?.code} - {course?.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Faculty: {facultyMember?.name} | Room: {classroom?.name} ({classroom?.building})
                        </div>
                      </div>
                      {item.conflicts.length > 0 && (
                        <div className="flex gap-1">
                          {item.conflicts.map(conflict => (
                            <Badge key={conflict} variant="destructive" className="text-xs">
                              {conflict}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </TabsContent>
              <TabsContent value="conflicts">
                {generatedSchedule.filter(item => item.conflicts.length > 0).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    No conflicts detected in the generated schedule!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {generatedSchedule.filter(item => item.conflicts.length > 0).map(item => {
                      const course = getCourse(item.courseId);
                      return (
                        <div key={item.id} className="p-3 border border-red-200 rounded bg-red-50">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive">{item.day} {item.timeSlot}</Badge>
                            <span className="font-medium">{course?.code}</span>
                          </div>
                          <div className="space-y-1">
                            {item.conflicts.map(conflict => (
                              <div key={conflict} className="text-red-600 text-sm">
                                • {conflict}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}