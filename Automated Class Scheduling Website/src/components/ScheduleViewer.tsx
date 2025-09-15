import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Grid, List, Download } from 'lucide-react';
import type { ScheduleItem } from './ScheduleGenerator';
import type { Course } from './CourseManager';
import type { Faculty } from './FacultyManager';
import type { Classroom } from './ClassroomManager';

interface ScheduleViewerProps {
  schedule: ScheduleItem[];
  courses: Course[];
  faculty: Faculty[];
  classrooms: Classroom[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
  '16:00-17:00', '17:00-18:00'
];

export function ScheduleViewer({ schedule, courses, faculty, classrooms }: ScheduleViewerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBy, setFilterBy] = useState<'all' | 'faculty' | 'classroom' | 'year'>('year');
  const [selectedFilter, setSelectedFilter] = useState<string>('FY');

  const getCourse = (courseId: string) => courses.find(c => c.id === courseId);
  const getFaculty = (facultyId: string) => faculty.find(f => f.id === facultyId);
  const getClassroom = (classroomId: string) => classrooms.find(r => r.id === classroomId);

  const filteredSchedule = schedule.filter(item => {
    if (filterBy === 'all' || !selectedFilter) return true;
    if (filterBy === 'faculty') return item.facultyId === selectedFilter;
    if (filterBy === 'classroom') return item.classroomId === selectedFilter;
    if (filterBy === 'year') return item.year === selectedFilter;
    return true;
  });

  const getScheduleForSlot = (day: string, timeSlot: string) => {
    return filteredSchedule.filter(item => item.day === day && item.timeSlot === timeSlot);
  };

  const exportSchedule = () => {
    const csvContent = [
      ['Day', 'Time', 'Course Code', 'Course Name', 'Faculty', 'Classroom', 'Building', 'Conflicts'].join(','),
      ...schedule.map(item => {
        const course = getCourse(item.courseId);
        const facultyMember = getFaculty(item.facultyId);
        const classroom = getClassroom(item.classroomId);
        return [
          item.day,
          item.timeSlot,
          course?.code || '',
          `"${course?.name || ''}"`,
          `"${facultyMember?.name || ''}"`,
          classroom?.name || '',
          classroom?.building || '',
          `"${item.conflicts.join('; ')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'class-schedule.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (schedule.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Schedule Generated</h3>
          <p className="text-muted-foreground">Generate a schedule first to view it here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Overview
              {filterBy === 'year' && selectedFilter && (
                <Badge variant="outline" className="ml-2">
                  {selectedFilter === 'FY' ? 'First Year' : selectedFilter === 'SY' ? 'Second Year' : 'Third Year'}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportSchedule}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
            </div>

            <div className="flex gap-2">
              <Select value={filterBy} onValueChange={(value) => {
                setFilterBy(value as 'all' | 'faculty' | 'classroom' | 'year');
                if (value === 'year') {
                  setSelectedFilter('FY');
                } else {
                  setSelectedFilter('');
                }
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="year">By Year</SelectItem>
                  <SelectItem value="faculty">By Faculty</SelectItem>
                  <SelectItem value="classroom">By Room</SelectItem>
                </SelectContent>
              </Select>

              {filterBy !== 'all' && (
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={`Select ${filterBy}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {filterBy === 'year' && (
                      <>
                        <SelectItem value="FY">First Year (FY)</SelectItem>
                        <SelectItem value="SY">Second Year (SY)</SelectItem>
                        <SelectItem value="TY">Third Year (TY)</SelectItem>
                      </>
                    )}
                    {filterBy === 'faculty' && faculty.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                    {filterBy === 'classroom' && classrooms.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name} - {r.building}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
            <TabsContent value="grid">
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-6 bg-muted">
                  <div className="p-3 font-medium border-r">Time</div>
                  {DAYS.map(day => (
                    <div key={day} className="p-3 font-medium border-r last:border-r-0 text-center">
                      {day}
                    </div>
                  ))}
                </div>
                {TIME_SLOTS.map(timeSlot => (
                  <div key={timeSlot} className="grid grid-cols-6 border-t">
                    <div className="p-3 bg-muted border-r font-medium text-sm">
                      {timeSlot}
                    </div>
                    {DAYS.map(day => {
                      const scheduleItems = getScheduleForSlot(day, timeSlot);
                      return (
                        <div key={day} className="p-2 border-r last:border-r-0 min-h-[80px]">
                          {scheduleItems.map(item => {
                            const course = getCourse(item.courseId);
                            const facultyMember = getFaculty(item.facultyId);
                            const classroom = getClassroom(item.classroomId);
                            return (
                              <div key={item.id} className={`p-2 rounded text-xs mb-1 ${
                                item.conflicts.length > 0 
                                  ? 'bg-red-100 border border-red-300' 
                                  : item.year === 'FY' ? 'bg-blue-100 border border-blue-300'
                                  : item.year === 'SY' ? 'bg-green-100 border border-green-300'
                                  : 'bg-purple-100 border border-purple-300'
                              }`}>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{course?.code}</span>
                                  <Badge variant="outline" className="text-xs">{item.year}</Badge>
                                </div>
                                <div className="text-muted-foreground truncate">
                                  {facultyMember?.name}
                                </div>
                                <div className="text-muted-foreground truncate">
                                  {classroom?.name}
                                </div>
                                {item.conflicts.length > 0 && (
                                  <Badge variant="destructive" className="text-xs mt-1">
                                    Conflict
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {DAYS.map(day => {
                  const daySchedule = filteredSchedule.filter(item => item.day === day);
                  if (daySchedule.length === 0) return null;

                  return (
                    <Card key={day}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{day}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {daySchedule
                          .sort((a, b) => TIME_SLOTS.indexOf(a.timeSlot) - TIME_SLOTS.indexOf(b.timeSlot))
                          .map(item => {
                            const course = getCourse(item.courseId);
                            const facultyMember = getFaculty(item.facultyId);
                            const classroom = getClassroom(item.classroomId);
                            
                            return (
                              <div key={item.id} className={`p-3 rounded border ${
                                item.conflicts.length > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'
                              }`}>
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">{item.timeSlot}</Badge>
                                      <span className="font-medium">
                                        {course?.code} - {course?.name}
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Faculty: {facultyMember?.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Room: {classroom?.name} ({classroom?.building})
                                      {classroom && (
                                        <Badge variant="secondary" className="ml-2">
                                          Capacity: {classroom.capacity}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {item.conflicts.length > 0 && (
                                    <div className="space-y-1">
                                      {item.conflicts.map(conflict => (
                                        <Badge key={conflict} variant="destructive" className="text-xs">
                                          {conflict}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}