import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Plus } from 'lucide-react';

export interface Classroom {
  id: string;
  name: string;
  building: string;
  capacity: number;
  type: 'Lecture Hall' | 'Lab' | 'Seminar Room' | 'Auditorium' | 'Studio';
  resources: string[];
  availability: {
    [day: string]: string[]; // Array of time slots
  };
}

interface ClassroomManagerProps {
  classrooms: Classroom[];
  onClassroomsChange: (classrooms: Classroom[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
  '16:00-17:00', '17:00-18:00'
];

const ROOM_TYPES = ['Lecture Hall', 'Lab', 'Seminar Room', 'Auditorium', 'Studio'] as const;
const AVAILABLE_RESOURCES = [
  'Projector', 'Whiteboard', 'Computer Lab', 'Science Lab', 
  'Audio System', 'Video Equipment', 'Smart Board', 'WiFi',
  'Air Conditioning', 'Microphone', 'Recording Equipment'
];

export function ClassroomManager({ classrooms, onClassroomsChange }: ClassroomManagerProps) {
  const [newClassroom, setNewClassroom] = useState<Omit<Classroom, 'id'>>({
    name: '',
    building: '',
    capacity: 30,
    type: 'Lecture Hall',
    resources: [],
    availability: {
      Monday: [...TIME_SLOTS],
      Tuesday: [...TIME_SLOTS],
      Wednesday: [...TIME_SLOTS],
      Thursday: [...TIME_SLOTS],
      Friday: [...TIME_SLOTS]
    }
  });

  const addClassroom = () => {
    if (newClassroom.name && newClassroom.building) {
      const classroom: Classroom = {
        ...newClassroom,
        id: Date.now().toString()
      };
      onClassroomsChange([...classrooms, classroom]);
      setNewClassroom({
        name: '',
        building: '',
        capacity: 30,
        type: 'Lecture Hall',
        resources: [],
        availability: {
          Monday: [...TIME_SLOTS],
          Tuesday: [...TIME_SLOTS],
          Wednesday: [...TIME_SLOTS],
          Thursday: [...TIME_SLOTS],
          Friday: [...TIME_SLOTS]
        }
      });
    }
  };

  const removeClassroom = (id: string) => {
    onClassroomsChange(classrooms.filter(room => room.id !== id));
  };

  const addResource = (resource: string) => {
    if (resource && !newClassroom.resources.includes(resource)) {
      setNewClassroom({
        ...newClassroom,
        resources: [...newClassroom.resources, resource]
      });
    }
  };

  const removeResource = (resource: string) => {
    setNewClassroom({
      ...newClassroom,
      resources: newClassroom.resources.filter(r => r !== resource)
    });
  };

  const toggleAvailability = (day: string, timeSlot: string) => {
    const currentSlots = newClassroom.availability[day] || [];
    const isAvailable = currentSlots.includes(timeSlot);
    
    const updatedSlots = isAvailable
      ? currentSlots.filter(slot => slot !== timeSlot)
      : [...currentSlots, timeSlot];

    setNewClassroom({
      ...newClassroom,
      availability: {
        ...newClassroom.availability,
        [day]: updatedSlots
      }
    });
  };

  const setAllAvailable = (day: string, available: boolean) => {
    setNewClassroom({
      ...newClassroom,
      availability: {
        ...newClassroom.availability,
        [day]: available ? [...TIME_SLOTS] : []
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Classroom</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                value={newClassroom.name}
                onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                placeholder="Room 101"
              />
            </div>
            <div>
              <Label htmlFor="building">Building</Label>
              <Input
                id="building"
                value={newClassroom.building}
                onChange={(e) => setNewClassroom({ ...newClassroom, building: e.target.value })}
                placeholder="Science Building"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={newClassroom.capacity}
                onChange={(e) => setNewClassroom({ ...newClassroom, capacity: parseInt(e.target.value) || 0 })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="roomType">Room Type</Label>
              <Select value={newClassroom.type} onValueChange={(value) => 
                setNewClassroom({ ...newClassroom, type: value as Classroom['type'] })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Resources</Label>
            <div className="flex gap-2 mb-2">
              <Select onValueChange={addResource}>
                <SelectTrigger>
                  <SelectValue placeholder="Add resource" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_RESOURCES.filter(r => !newClassroom.resources.includes(r)).map(resource => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              {newClassroom.resources.map(resource => (
                <Badge key={resource} variant="outline" className="cursor-pointer"
                       onClick={() => removeResource(resource)}>
                  {resource} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Availability</Label>
            <div className="grid grid-cols-5 gap-4 mt-2">
              {DAYS.map(day => (
                <div key={day} className="border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4>{day}</h4>
                    <div className="space-x-1">
                      <Button size="sm" variant="outline" 
                              onClick={() => setAllAvailable(day, true)}>
                        All
                      </Button>
                      <Button size="sm" variant="outline" 
                              onClick={() => setAllAvailable(day, false)}>
                        None
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {TIME_SLOTS.map(timeSlot => {
                      const isAvailable = newClassroom.availability[day]?.includes(timeSlot);
                      return (
                        <div key={timeSlot} 
                             className={`p-1 text-xs text-center rounded cursor-pointer ${
                               isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                             }`}
                             onClick={() => toggleAvailability(day, timeSlot)}>
                          {timeSlot}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={addClassroom} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Classroom
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3>Classrooms ({classrooms.length})</h3>
        {classrooms.map(classroom => (
          <Card key={classroom.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4>{classroom.name}</h4>
                    <Badge variant="outline">{classroom.building}</Badge>
                    <Badge>{classroom.type}</Badge>
                    <Badge variant="secondary">Capacity: {classroom.capacity}</Badge>
                  </div>
                  {classroom.resources.length > 0 && (
                    <div>
                      <span className="text-sm">Resources: </span>
                      {classroom.resources.map(resource => (
                        <Badge key={resource} variant="outline" className="mr-1">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div>
                    <span className="text-sm">Available: </span>
                    {DAYS.map(day => {
                      const daySlots = classroom.availability[day] || [];
                      return daySlots.length > 0 ? (
                        <Badge key={day} variant="outline" className="mr-1">
                          {day} ({daySlots.length}/{TIME_SLOTS.length} slots)
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => removeClassroom(classroom.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}