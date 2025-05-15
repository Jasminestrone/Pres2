import tensorflow as tf
import numpy as np
import tensorflow as tf




# Sample data
X = np.array([[1, 2], [3, 4], [5, 6]])
y = np.array([3, 7, 11])

# Model definition
model = tf.keras.Sequential([
    tf.keras.layers.Dense(1, input_shape=(2,))
])

# Model compilation
model.compile(optimizer='sgd', loss='mse')

# Model training
model.fit(X, y, epochs=10)

# Model evaluation
loss = model.evaluate(X, y)
print('Loss:', loss)

# Prediction
X_new = np.array([[7, 8]])
y_pred = model.predict(X_new)
print('Prediction:', y_pred)

# Save model
model.save('my_model')

# Load model
loaded_model = tf.keras.models.load_model('my_model')

# Prediction with loaded model
y_pred_loaded = loaded_model.predict(X_new)
print('Prediction with loaded model:', y_pred_loaded)