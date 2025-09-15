import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Plus } from 'lucide-react';

export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  year: 'FY' | 'SY' | 'TY'; // Academic year
  assignedTeacherId: string; // Which teacher will teach this course
  prerequisites: string[];
  requiredResources: string[];
  enrollmentLimit: number;
  duration: number; // in hours
}

interface CourseManagerProps {
  courses: Course[];
  faculty: Faculty[];
  onCoursesChange: (courses: Course[]) => void;
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  specializations: string[];
  maxHoursPerWeek: number;
  availability: {
    [day: string]: string[];
  };
}

export function CourseManager({ courses, faculty, onCoursesChange }: CourseManagerProps) {
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id'>>({
    name: '',
    code: '',
    credits: 3,
    year: 'FY',
    assignedTeacherId: '',
    prerequisites: [],
    requiredResources: [],
    enrollmentLimit: 30,
    duration: 3
  });

  const addCourse = () => {
    if (newCourse.name && newCourse.code && newCourse.assignedTeacherId) {
      const course: Course = {
        ...newCourse,
        id: Date.now().toString()
      };
      onCoursesChange([...courses, course]);
      setNewCourse({
        name: '',
        code: '',
        credits: 3,
        year: 'FY',
        assignedTeacherId: '',
        prerequisites: [],
        requiredResources: [],
        enrollmentLimit: 30,
        duration: 3
      });
    }
  };

  const removeCourse = (id: string) => {
    onCoursesChange(courses.filter(course => course.id !== id));
  };

  const addPrerequisite = (prerequisite: string) => {
    if (prerequisite && !newCourse.prerequisites.includes(prerequisite)) {
      setNewCourse({
        ...newCourse,
        prerequisites: [...newCourse.prerequisites, prerequisite]
      });
    }
  };

  const addResource = (resource: string) => {
    if (resource && !newCourse.requiredResources.includes(resource)) {
      setNewCourse({
        ...newCourse,
        requiredResources: [...newCourse.requiredResources, resource]
      });
    }
  };

  const resources = ['Computer Lab', 'Science Lab', 'Projector', 'Whiteboard', 'Audio System', 'Video Equipment'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                placeholder="Introduction to Computer Science"
              />
            </div>
            <div>
              <Label htmlFor="courseCode">Course Code</Label>
              <Input
                id="courseCode"
                value={newCourse.code}
                onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                placeholder="CS101"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select value={newCourse.year} onValueChange={(value) => 
                setNewCourse({ ...newCourse, year: value as 'FY' | 'SY' | 'TY' })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FY">First Year (FY)</SelectItem>
                  <SelectItem value="SY">Second Year (SY)</SelectItem>
                  <SelectItem value="TY">Third Year (TY)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignedTeacher">Assigned Teacher</Label>
              <Select value={newCourse.assignedTeacherId} onValueChange={(value) => 
                setNewCourse({ ...newCourse, assignedTeacherId: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {faculty.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                value={newCourse.credits}
                onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 0 })}
                min="1"
                max="6"
              />
            </div>
            <div>
              <Label htmlFor="enrollmentLimit">Enrollment Limit</Label>
              <Input
                id="enrollmentLimit"
                type="number"
                value={newCourse.enrollmentLimit}
                onChange={(e) => setNewCourse({ ...newCourse, enrollmentLimit: parseInt(e.target.value) || 0 })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                value={newCourse.duration}
                onChange={(e) => setNewCourse({ ...newCourse, duration: parseInt(e.target.value) || 0 })}
                min="1"
                max="6"
              />
            </div>
          </div>

          <div>
            <Label>Prerequisites</Label>
            <div className="flex gap-2 mb-2">
              <Select onValueChange={addPrerequisite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select prerequisite" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.code}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              {newCourse.prerequisites.map(prereq => (
                <Badge key={prereq} variant="secondary" className="cursor-pointer"
                       onClick={() => setNewCourse({
                         ...newCourse,
                         prerequisites: newCourse.prerequisites.filter(p => p !== prereq)
                       })}>
                  {prereq} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Required Resources</Label>
            <div className="flex gap-2 mb-2">
              <Select onValueChange={addResource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select required resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map(resource => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              {newCourse.requiredResources.map(resource => (
                <Badge key={resource} variant="outline" className="cursor-pointer"
                       onClick={() => setNewCourse({
                         ...newCourse,
                         requiredResources: newCourse.requiredResources.filter(r => r !== resource)
                       })}>
                  {resource} ×
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={addCourse} disabled={!newCourse.name || !newCourse.code || !newCourse.assignedTeacherId} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3>Existing Courses ({courses.length})</h3>
        
        {/* Group courses by year */}
        {['FY', 'SY', 'TY'].map(year => {
          const yearCourses = courses.filter(course => course.year === year);
          if (yearCourses.length === 0) return null;
          
          return (
            <div key={year} className="space-y-2">
              <h4 className="text-lg font-medium">
                {year === 'FY' ? 'First Year (FY)' : year === 'SY' ? 'Second Year (SY)' : 'Third Year (TY)'} 
                <Badge variant="secondary" className="ml-2">{yearCourses.length} courses</Badge>
              </h4>
              {yearCourses.map(course => {
                const assignedTeacher = faculty.find(f => f.id === course.assignedTeacherId);
                return (
                  <Card key={course.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4>{course.code} - {course.name}</h4>
                            <Badge variant="outline">{course.year}</Badge>
                            <Badge>{course.credits} credits</Badge>
                            <Badge variant="outline">{course.duration}h</Badge>
                          </div>
                          <p className="text-muted-foreground">
                            Teacher: {assignedTeacher?.name || 'Unassigned'} | Enrollment Limit: {course.enrollmentLimit}
                          </p>
                          {course.prerequisites.length > 0 && (
                            <div>
                              <span className="text-sm">Prerequisites: </span>
                              {course.prerequisites.map(prereq => (
                                <Badge key={prereq} variant="secondary" className="mr-1">
                                  {prereq}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {course.requiredResources.length > 0 && (
                            <div>
                              <span className="text-sm">Required Resources: </span>
                              {course.requiredResources.map(resource => (
                                <Badge key={resource} variant="outline" className="mr-1">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => removeCourse(course.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}