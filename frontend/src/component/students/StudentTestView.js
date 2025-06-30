import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Container, Radio, RadioGroup, FormControlLabel, TextField, Button } from '@mui/material';

const StudentTestView = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`/api/tests/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setTest(data);
        setTimeLeft(data.duration * 60); // Convert minutes to seconds
        
        // Initialize answers object
        const initialAnswers = {};
        data.questions.forEach((q, index) => {
          initialAnswers[index] = q.questionType === 'mcq' ? '' : '';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error fetching test:', error);
      }
    };
    
    fetchTest();
    
    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [id]);
  
  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };
  
  const handleSubmit = async () => {
    try {
      await fetch('/api/test-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          testId: id,
          answers: Object.values(answers)
        })
      });
      alert('Test submitted successfully!');
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };
  
  if (!test) return <div>Loading...</div>;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">{test.title}</Typography>
        <Typography variant="h5" color={timeLeft < 300 ? 'error' : 'primary'}>
          Time Remaining: {formatTime(timeLeft)}
        </Typography>
      </Box>
      
      <Typography variant="body1" paragraph>{test.description}</Typography>
      
      <Box component="form">
        {test.questions.map((question, index) => (
          <Box key={index} mb={4} p={3} sx={{ border: '1px solid #eee', borderRadius: 1 }}>
            <Typography variant="h6">
              Question {index + 1} ({question.points} points)
            </Typography>
            <Typography paragraph>{question.questionText}</Typography>
            
            {question.questionType === 'mcq' ? (
              <RadioGroup
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              >
                {question.options.map((option, optIndex) => (
                  <FormControlLabel
                    key={optIndex}
                    value={option.text}
                    control={<Radio />}
                    label={option.text}
                  />
                ))}
              </RadioGroup>
            ) : (
              <TextField
                fullWidth
                multiline
                rows={question.questionType === 'short-answer' ? 3 : 6}
                variant="outlined"
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              />
            )}
          </Box>
        ))}
        
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
          >
            Submit Test
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default StudentTestView;