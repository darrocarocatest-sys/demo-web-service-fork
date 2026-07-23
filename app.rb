# Minimal Ruby helper so RuboCop has a file to analyze.
class Greeter
  def initialize(name)
    @name = name
  end

  def greet
    puts "Hello, #{@name}!"
  end
end

Greeter.new("world").greet
