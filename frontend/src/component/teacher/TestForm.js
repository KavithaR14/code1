import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const TestForm = () => {
  const [test, setTest] = useState({
    title: '',
    description: '',
    duration: 30,
    availableFrom: '',
    availableTo: '',
    questions: []
  });
  
  const [currentQuestion, setCurrentQuestion] = useState({
    questionType: 'mcq',
    questionText: '',
    options: [{ text: '', isCorrect: false }],
    points: 1
  });
  
  const navigate = useNavigate();

  const handleTestChange = (e) => {
    setTest({ ...test, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({ ...currentQuestion, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index, e) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index][e.target.name] = e.target.name === 'isCorrect' ? e.target.checked : e.target.value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { text: '', isCorrect: false }]
    });
  };

  const addQuestion = () => {
    setTest({
      ...test,
      questions: [...test.questions, currentQuestion]
    });
    setCurrentQuestion({
      questionType: 'mcq',
      questionText: '',
      options: [{ text: '', isCorrect: false }],
      points: 1
    });
  };

  const submitTest = async () => {
    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(test)
      });
      
      if (response.ok) {
        navigate('/tests');
      }
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Create New Test</Typography>
      
      <Box mb={4}>
        <TextField
          fullWidth
          label="Test Title"
          name="title"
          value={test.title}
          onChange={handleTestChange}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={test.description}
          onChange={handleTestChange}
          margin="normal"
          multiline
          rows={3}
        />
        
        <TextField
          fullWidth
          label="Duration (minutes)"
          name="duration"
          type="number"
          value={test.duration}
          onChange={handleTestChange}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Available From"
          name="availableFrom"
          type="datetime-local"
          value={test.availableFrom}
          onChange={handleTestChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        
        <TextField
          fullWidth
          label="Available To"
          name="availableTo"
          type="datetime-local"
          value={test.availableTo}
          onChange={handleTestChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
      </Box>
      
      <Typography variant="h5" gutterBottom>Add Questions</Typography>
      
      <Box mb={4} p={2} sx={{ border: '1px dashed grey', borderRadius: 1 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Question Type</InputLabel>
          <Select
            name="questionType"
            value={currentQuestion.questionType}
            onChange={handleQuestionChange}
          >
            <MenuItem value="mcq">Multiple Choice</MenuItem>
            <MenuItem value="short-answer">Short Answer</MenuItem>
            <MenuItem value="essay">Essay</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="Question Text"
          name="questionText"
          value={currentQuestion.questionText}
          onChange={handleQuestionChange}
          margin="normal"
          required
          multiline
          rows={2}
        />
        
        <TextField
          fullWidth
          label="Points"
          name="points"
          type="number"
          value={currentQuestion.points}
          onChange={handleQuestionChange}
          margin="normal"
        />
        
        {currentQuestion.questionType === 'mcq' && (
          <Box mt={2}>
            <Typography variant="subtitle1">Options</Typography>
            {currentQuestion.options.map((option, index) => (
              <Box key={index} display="flex" alignItems="center" gap={2} mb={1}>
                <TextField
                  fullWidth
                  label={`Option ${index + 1}`}
                  name="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e)}
                />
                <Box display="flex" alignItems="center">
                  <input
                    type="checkbox"
                    name="isCorrect"
                    checked={option.isCorrect}
                    onChange={(e) => handleOptionChange(index, e)}
                  />
                  <Typography ml={1}>Correct</Typography>
                </Box>
              </Box>
            ))}
            <Button onClick={addOption} variant="outlined">Add Option</Button>
          </Box>
        )}
        
        <Box mt={2}>
          <Button onClick={addQuestion} variant="contained" color="primary">
            Add Question to Test
          </Button>
        </Box>
      </Box>
      
      <Box mt={4}>
        <Typography variant="h5">Test Preview</Typography>
        <Typography variant="h6">{test.title}</Typography>
        <Typography>{test.description}</Typography>
        <Typography>Duration: {test.duration} minutes</Typography>
        
        {test.questions.map((q, qIndex) => (
          <Box key={qIndex} mt={2} p={2} sx={{ border: '1px solid #eee', borderRadius: 1 }}>
            <Typography><strong>Q{qIndex + 1}:</strong> {q.questionText} ({q.points} points)</Typography>
            {q.questionType === 'mcq' && (
              <ul>
                {q.options.map((opt, optIndex) => (
                  <li key={optIndex}>{opt.text}</li>
                ))}
              </ul>
            )}
          </Box>
        ))}
      </Box>
      
      <Box mt={4}>
        <Button onClick={submitTest} variant="contained" color="success" size="large">
          Create Test
        </Button>
      </Box>
    </Container>
  );
};

export default TestForm;